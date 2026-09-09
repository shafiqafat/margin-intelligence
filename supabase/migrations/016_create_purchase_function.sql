create or replace function public.create_purchase(
  p_business_id uuid,
  p_supplier_id uuid,
  p_purchase_date date,
  p_reference text,
  p_shipping_cost numeric,
  p_additional_cost numeric,
  p_notes text,
  p_items jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_purchase_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_quantity numeric;
  v_unit_cost numeric;
  v_item_total numeric;
  v_subtotal numeric := 0;
  v_total_cost numeric;
  v_shared_cost numeric;
begin
  -- Basic validation
  if p_business_id is null then
    raise exception 'Business ID is required';
  end if;

  if p_supplier_id is null then
    raise exception 'Supplier is required';
  end if;

  if p_purchase_date is null then
    raise exception 'Purchase date is required';
  end if;

  if p_shipping_cost < 0 then
    raise exception 'Shipping cost cannot be negative';
  end if;

  if p_additional_cost < 0 then
    raise exception 'Additional cost cannot be negative';
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'At least one purchase item is required';
  end if;

  -- Verify supplier belongs to business
  if not exists (
    select 1
    from suppliers
    where id = p_supplier_id
      and business_id = p_business_id
  ) then
    raise exception 'Supplier does not belong to this business';
  end if;

  -- Validate items and calculate subtotal
  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop
    v_product_id :=
      (v_item ->> 'productId')::uuid;

    v_quantity :=
      (v_item ->> 'quantity')::numeric;

    v_unit_cost :=
      (v_item ->> 'unitCost')::numeric;

    if v_quantity <= 0 then
      raise exception 'Quantity must be greater than zero';
    end if;

    if v_unit_cost < 0 then
      raise exception 'Unit cost cannot be negative';
    end if;

    if not exists (
      select 1
      from products
      where id = v_product_id
        and business_id = p_business_id
    ) then
      raise exception 'Product does not belong to this business';
    end if;

    v_item_total :=
      v_quantity * v_unit_cost;

    v_subtotal :=
      v_subtotal + v_item_total;
  end loop;

  v_total_cost :=
    v_subtotal
    + p_shipping_cost
    + p_additional_cost;

  -- Create purchase
  insert into purchases (
    business_id,
    supplier_id,
    purchase_date,
    reference,
    subtotal,
    shipping_cost,
    additional_cost,
    total_cost,
    notes
  )
  values (
    p_business_id,
    p_supplier_id,
    p_purchase_date,
    nullif(trim(p_reference), ''),
    v_subtotal,
    p_shipping_cost,
    p_additional_cost,
    v_total_cost,
    nullif(trim(p_notes), '')
  )
  returning id into v_purchase_id;

  -- Create purchase items
  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop
    v_product_id :=
      (v_item ->> 'productId')::uuid;

    v_quantity :=
      (v_item ->> 'quantity')::numeric;

    v_unit_cost :=
      (v_item ->> 'unitCost')::numeric;

    v_item_total :=
      v_quantity * v_unit_cost;

    insert into purchase_items (
      purchase_id,
      product_id,
      quantity,
      unit_cost,
      total_cost
    )
    values (
      v_purchase_id,
      v_product_id,
      v_quantity,
      v_unit_cost,
      v_item_total
    );
  end loop;

  -- Shared purchase costs
  v_shared_cost :=
    p_shipping_cost
    + p_additional_cost;

  if v_shared_cost > 0 then

    for v_item in
      select value
      from jsonb_array_elements(p_items)
    loop
      v_product_id :=
        (v_item ->> 'productId')::uuid;

      v_quantity :=
        (v_item ->> 'quantity')::numeric;

      v_unit_cost :=
        (v_item ->> 'unitCost')::numeric;

      v_item_total :=
        v_quantity * v_unit_cost;

      insert into cost_allocations (
        business_id,
        source_type,
        source_id,
        product_id,
        amount,
        allocation_method
      )
      values (
        p_business_id,
        'purchase',
        v_purchase_id,
        v_product_id,
        v_shared_cost *
          (v_item_total / v_subtotal),
        'proportional_to_purchase_value'
      );
    end loop;

  end if;

  return v_purchase_id;
end;
$$;