create or replace function public.create_return(
  p_business_id uuid,
  p_sale_id uuid,
  p_product_id uuid,
  p_quantity numeric,
  p_reason text,
  p_refund_amount numeric,
  p_return_shipping_cost numeric,
  p_restocking_cost numeric,
  p_return_date date,
  p_notes text
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_return_id uuid;

  v_sale_business_id uuid;
  v_product_business_id uuid;

  v_sold_quantity numeric;
  v_returned_quantity numeric;
  v_available_quantity numeric;

  v_product_revenue numeric;
  v_previous_refunds numeric;
  v_available_refund numeric;
begin
  /*
   * ---------------------------------------------------------
   * 1. Basic input validation
   * ---------------------------------------------------------
   */

  if p_business_id is null then
    raise exception 'Business is required';
  end if;

  if p_sale_id is null then
    raise exception 'Sale is required';
  end if;

  if p_product_id is null then
    raise exception 'Product is required';
  end if;

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Return quantity must be greater than zero';
  end if;

  if p_refund_amount is null or p_refund_amount < 0 then
    raise exception 'Refund amount cannot be negative';
  end if;

  if p_return_shipping_cost is null or p_return_shipping_cost < 0 then
    raise exception 'Return shipping cost cannot be negative';
  end if;

  if p_restocking_cost is null or p_restocking_cost < 0 then
    raise exception 'Restocking cost cannot be negative';
  end if;

  if p_return_date is null then
    raise exception 'Return date is required';
  end if;


  /*
   * ---------------------------------------------------------
   * 2. Verify the business belongs to the authenticated user
   * ---------------------------------------------------------
   */

  if not exists (
    select 1
    from public.businesses b
    where b.id = p_business_id
      and b.owner_id = auth.uid()
  ) then
    raise exception 'Business access denied';
  end if;


  /*
   * ---------------------------------------------------------
   * 3. Verify the sale belongs to the business
   * ---------------------------------------------------------
   */

  select s.business_id
  into v_sale_business_id
  from public.sales s
  where s.id = p_sale_id;

  if v_sale_business_id is null then
    raise exception 'Sale not found';
  end if;

  if v_sale_business_id <> p_business_id then
    raise exception 'Sale does not belong to this business';
  end if;


  /*
   * ---------------------------------------------------------
   * 4. Verify the product belongs to the business
   * ---------------------------------------------------------
   */

  select p.business_id
  into v_product_business_id
  from public.products p
  where p.id = p_product_id;

  if v_product_business_id is null then
    raise exception 'Product not found';
  end if;

  if v_product_business_id <> p_business_id then
    raise exception 'Product does not belong to this business';
  end if;


  /*
   * ---------------------------------------------------------
   * 5. Determine how many units of this product were sold
   * ---------------------------------------------------------
   */

  select coalesce(sum(si.quantity), 0)
  into v_sold_quantity
  from public.sale_items si
  where si.sale_id = p_sale_id
    and si.product_id = p_product_id;


  if v_sold_quantity <= 0 then
    raise exception 'Product was not included in this sale';
  end if;


  /*
   * ---------------------------------------------------------
   * 6. Determine how many units were already returned
   * ---------------------------------------------------------
   */

  select coalesce(sum(r.quantity), 0)
  into v_returned_quantity
  from public.returns r
  where r.sale_id = p_sale_id
    and r.product_id = p_product_id;


  v_available_quantity :=
    v_sold_quantity - v_returned_quantity;


  /*
   * ---------------------------------------------------------
   * 7. Prevent returning more units than remain available
   * ---------------------------------------------------------
   */

  if p_quantity > v_available_quantity then
    raise exception
      'Return quantity exceeds available quantity. Available: %, requested: %',
      v_available_quantity,
      p_quantity;
  end if;


  /*
   * ---------------------------------------------------------
   * 8. Calculate the remaining refundable product revenue
   *
   *    Sale item revenue:
   *      quantity * unit_price - discount
   *
   *    We do not include shipping revenue here because this
   *    return is tied to a specific product.
   * ---------------------------------------------------------
   */

  select coalesce(
    sum(
      (si.quantity * si.unit_price) - si.discount
    ),
    0
  )
  into v_product_revenue
  from public.sale_items si
  where si.sale_id = p_sale_id
    and si.product_id = p_product_id;


  /*
   * ---------------------------------------------------------
   * 9. Determine refunds already recorded for this product
   * ---------------------------------------------------------
   */

  select coalesce(sum(r.refund_amount), 0)
  into v_previous_refunds
  from public.returns r
  where r.sale_id = p_sale_id
    and r.product_id = p_product_id;


  v_available_refund :=
    v_product_revenue - v_previous_refunds;


  /*
   * ---------------------------------------------------------
   * 10. Prevent refunding more revenue than remains available
   * ---------------------------------------------------------
   */

  if p_refund_amount > v_available_refund then
    raise exception
      'Refund amount exceeds remaining refundable amount. Available: %, requested: %',
      v_available_refund,
      p_refund_amount;
  end if;


  /*
   * ---------------------------------------------------------
   * 11. Create the return
   * ---------------------------------------------------------
   */

  insert into public.returns (
    business_id,
    sale_id,
    product_id,
    quantity,
    reason,
    refund_amount,
    return_shipping_cost,
    restocking_cost,
    return_date,
    notes
  )
  values (
    p_business_id,
    p_sale_id,
    p_product_id,
    p_quantity,
    nullif(trim(p_reason), ''),
    p_refund_amount,
    p_return_shipping_cost,
    p_restocking_cost,
    p_return_date,
    nullif(trim(p_notes), '')
  )
  returning id into v_return_id;


  return v_return_id;
end;
$$;