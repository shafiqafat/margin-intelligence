create or replace function public.create_sale(
  p_business_id uuid,
  p_sale_date date,
  p_reference text,
  p_shipping_revenue numeric,
  p_delivery_cost numeric,
  p_payment_fee numeric,
  p_notes text,
  p_items jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_sale_id uuid;
  v_total_product_revenue numeric := 0;
  v_total_revenue numeric := 0;
  v_item jsonb;
  v_product_id uuid;
  v_quantity numeric;
  v_unit_price numeric;
  v_discount numeric;
  v_total_price numeric;
begin
  /*
    ---------------------------------------------------------
    1. Basic sale validation
    ---------------------------------------------------------
  */

  if p_business_id is null then
    raise exception 'Business is required';
  end if;

  if p_sale_date is null then
    raise exception 'Sale date is required';
  end if;

  if p_shipping_revenue is null or p_shipping_revenue < 0 then
    raise exception 'Shipping revenue cannot be negative';
  end if;

  if p_delivery_cost is null or p_delivery_cost < 0 then
    raise exception 'Delivery cost cannot be negative';
  end if;

  if p_payment_fee is null or p_payment_fee < 0 then
    raise exception 'Payment fee cannot be negative';
  end if;

  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one sale item is required';
  end if;


  /*
    ---------------------------------------------------------
    2. Verify the business exists
    ---------------------------------------------------------
  */

  if not exists (
    select 1
    from businesses
    where id = p_business_id
  ) then
    raise exception 'Business not found';
  end if;


  /*
    ---------------------------------------------------------
    3. Validate every sale item
    ---------------------------------------------------------
  */

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop

    v_product_id := (v_item ->> 'productId')::uuid;
    v_quantity := (v_item ->> 'quantity')::numeric;
    v_unit_price := (v_item ->> 'unitPrice')::numeric;
    v_discount := coalesce(
      (v_item ->> 'discount')::numeric,
      0
    );

    if v_product_id is null then
      raise exception 'Sale item product is required';
    end if;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Sale item quantity must be greater than zero';
    end if;

    if v_unit_price is null or v_unit_price < 0 then
      raise exception 'Sale item unit price cannot be negative';
    end if;

    if v_discount < 0 then
      raise exception 'Sale item discount cannot be negative';
    end if;

    if v_discount > (v_quantity * v_unit_price) then
      raise exception 'Sale item discount cannot exceed item value';
    end if;


    /*
      -------------------------------------------------------
      Verify product belongs to the current business
      -------------------------------------------------------
    */

    if not exists (
      select 1
      from products
      where id = v_product_id
        and business_id = p_business_id
    ) then
      raise exception 'Product does not belong to this business';
    end if;


    /*
      -------------------------------------------------------
      Calculate item revenue
      -------------------------------------------------------
    */

    v_total_price :=
      (v_quantity * v_unit_price) - v_discount;

    v_total_product_revenue :=
      v_total_product_revenue + v_total_price;

  end loop;


  /*
    ---------------------------------------------------------
    4. Calculate total revenue
    ---------------------------------------------------------

    V1 rule:

      Product Revenue
      + Shipping Revenue
      = Total Revenue

    Sale-level discount is intentionally not included here.
    Item-level discounts are already reflected in
    sale_items.total_price.
  */

  v_total_revenue :=
    v_total_product_revenue + p_shipping_revenue;


  /*
    ---------------------------------------------------------
    5. Create sale
    ---------------------------------------------------------
  */

  insert into sales (
    business_id,
    sale_date,
    reference,
    shipping_revenue,
    delivery_cost,
    payment_fee,
    total_revenue,
    notes
  )
  values (
    p_business_id,
    p_sale_date,
    nullif(trim(p_reference), ''),
    p_shipping_revenue,
    p_delivery_cost,
    p_payment_fee,
    v_total_revenue,
    p_notes
  )
  returning id into v_sale_id;


  /*
    ---------------------------------------------------------
    6. Create sale items
    ---------------------------------------------------------
  */

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop

    v_product_id := (v_item ->> 'productId')::uuid;
    v_quantity := (v_item ->> 'quantity')::numeric;
    v_unit_price := (v_item ->> 'unitPrice')::numeric;
    v_discount := coalesce(
      (v_item ->> 'discount')::numeric,
      0
    );

    v_total_price :=
      (v_quantity * v_unit_price) - v_discount;

    insert into sale_items (
      sale_id,
      product_id,
      quantity,
      unit_price,
      discount,
      total_price
    )
    values (
      v_sale_id,
      v_product_id,
      v_quantity,
      v_unit_price,
      v_discount,
      v_total_price
    );

  end loop;


  /*
    ---------------------------------------------------------
    7. Return the newly created sale ID
    ---------------------------------------------------------
  */

  return v_sale_id;

end;
$$;