-- ============================================
-- Margin Intelligence
-- Migration 015: Development Seed Data
-- ============================================

-- IMPORTANT:
-- Replace YOUR_BUSINESS_ID below with the Business ID
-- of your development business before running this migration.


do $$
declare
  v_business_id uuid := '43a09477-8166-4487-b578-613c19d61fdd';

  -- Product IDs
  v_black_tshirt uuid := gen_random_uuid();
  v_classic_dress uuid := gen_random_uuid();
  v_canvas_bag uuid := gen_random_uuid();
  v_premium_hoodie uuid := gen_random_uuid();
  v_classic_watch uuid := gen_random_uuid();

  -- Supplier IDs
  v_dhaka_apparel uuid := gen_random_uuid();
  v_fashion_source uuid := gen_random_uuid();
  v_accessories_hub uuid := gen_random_uuid();

  -- Cost category IDs
  v_packaging_category uuid := gen_random_uuid();
  v_delivery_category uuid := gen_random_uuid();
  v_general_category uuid := gen_random_uuid();

  -- Purchase IDs
  v_purchase_1 uuid := gen_random_uuid();
  v_purchase_2 uuid := gen_random_uuid();
  v_purchase_3 uuid := gen_random_uuid();

  -- Sale IDs
  v_sale_1 uuid := gen_random_uuid();
  v_sale_2 uuid := gen_random_uuid();
  v_sale_3 uuid := gen_random_uuid();
  v_sale_4 uuid := gen_random_uuid();

begin

  -- ============================================
  -- Validate Business
  -- ============================================

  if not exists (
    select 1
    from public.businesses
    where id = v_business_id
  ) then
    raise exception 'Business ID does not exist: %', v_business_id;
  end if;


  -- ============================================
  -- Products
  -- ============================================

  insert into public.products (
    id,
    business_id,
    name,
    sku,
    category,
    selling_price,
    target_margin,
    status
  )
  values
    (
      v_black_tshirt,
      v_business_id,
      'Black T-Shirt',
      'TS-BLK-001',
      'Clothing',
      850.00,
      40.00,
      'active'
    ),
    (
      v_classic_dress,
      v_business_id,
      'Classic Dress',
      'DR-CLS-001',
      'Clothing',
      1650.00,
      42.00,
      'active'
    ),
    (
      v_canvas_bag,
      v_business_id,
      'Canvas Bag',
      'BG-CNV-001',
      'Accessories',
      750.00,
      45.00,
      'active'
    ),
    (
      v_premium_hoodie,
      v_business_id,
      'Premium Hoodie',
      'HD-PRM-001',
      'Clothing',
      1800.00,
      40.00,
      'active'
    ),
    (
      v_classic_watch,
      v_business_id,
      'Classic Watch',
      'WT-CLS-001',
      'Accessories',
      2200.00,
      45.00,
      'active'
    );


  -- ============================================
  -- Suppliers
  -- ============================================

  insert into public.suppliers (
    id,
    business_id,
    name,
    contact_name,
    email,
    phone,
    notes
  )
  values
    (
      v_dhaka_apparel,
      v_business_id,
      'Dhaka Apparel Supply',
      'Rahim Hasan',
      'rahim@example.com',
      '+8801700000001',
      'Primary clothing supplier'
    ),
    (
      v_fashion_source,
      v_business_id,
      'Fashion Source BD',
      'Nusrat Ahmed',
      'nusrat@example.com',
      '+8801700000002',
      'Alternative clothing supplier'
    ),
    (
      v_accessories_hub,
      v_business_id,
      'Accessories Hub',
      'Tanvir Islam',
      'tanvir@example.com',
      '+8801700000003',
      'Bags and accessories supplier'
    );


  -- ============================================
  -- Product ↔ Supplier Relationships
  -- ============================================

  insert into public.product_suppliers (
    product_id,
    supplier_id,
    is_primary
  )
  values
    (v_black_tshirt, v_dhaka_apparel, true),
    (v_black_tshirt, v_fashion_source, false),
    (v_classic_dress, v_dhaka_apparel, true),
    (v_classic_dress, v_fashion_source, false),
    (v_canvas_bag, v_accessories_hub, true),
    (v_premium_hoodie, v_dhaka_apparel, true),
    (v_premium_hoodie, v_fashion_source, false),
    (v_classic_watch, v_accessories_hub, true);


  -- ============================================
  -- Cost Categories
  -- ============================================

  insert into public.cost_categories (
    id,
    business_id,
    name,
    type
  )
  values
    (
      v_packaging_category,
      v_business_id,
      'Packaging',
      'direct'
    ),
    (
      v_delivery_category,
      v_business_id,
      'Delivery',
      'direct'
    ),
    (
      v_general_category,
      v_business_id,
      'General Overhead',
      'overhead'
    );


  -- ============================================
  -- Product Cost Profiles
  -- ============================================

  insert into public.product_cost_profiles (
    product_id,
    expected_purchase_cost,
    expected_shipping_cost,
    expected_packaging_cost,
    expected_payment_fee,
    expected_delivery_cost,
    target_margin,
    effective_from
  )
  values
    (
      v_black_tshirt,
      480.00,
      25.00,
      20.00,
      15.00,
      60.00,
      40.00,
      '2026-01-01'
    ),
    (
      v_classic_dress,
      900.00,
      35.00,
      30.00,
      25.00,
      70.00,
      42.00,
      '2026-01-01'
    ),
    (
      v_canvas_bag,
      350.00,
      20.00,
      15.00,
      15.00,
      60.00,
      45.00,
      '2026-01-01'
    ),
    (
      v_premium_hoodie,
      950.00,
      40.00,
      30.00,
      30.00,
      80.00,
      40.00,
      '2026-01-01'
    ),
    (
      v_classic_watch,
      1100.00,
      30.00,
      20.00,
      30.00,
      70.00,
      45.00,
      '2026-01-01'
    );


  -- ============================================
  -- Purchases
  -- ============================================

  insert into public.purchases (
    id,
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
  values
    (
      v_purchase_1,
      v_business_id,
      v_dhaka_apparel,
      '2026-08-01',
      'PO-1001',
      127500.00,
      5000.00,
      2500.00,
      135000.00,
      'Clothing restock'
    ),
    (
      v_purchase_2,
      v_business_id,
      v_fashion_source,
      '2026-08-15',
      'PO-1002',
      82500.00,
      3500.00,
      1500.00,
      87500.00,
      'Alternative supplier purchase'
    ),
    (
      v_purchase_3,
      v_business_id,
      v_accessories_hub,
      '2026-08-20',
      'PO-1003',
      58000.00,
      2500.00,
      1000.00,
      61500.00,
      'Accessories restock'
    );


  -- ============================================
  -- Purchase Items
  -- ============================================

  insert into public.purchase_items (
    purchase_id,
    product_id,
    quantity,
    unit_cost,
    total_cost
  )
  values
    -- Purchase 1
    (
      v_purchase_1,
      v_black_tshirt,
      150,
      500.00,
      75000.00
    ),
    (
      v_purchase_1,
      v_classic_dress,
      50,
      950.00,
      47500.00
    ),
    (
      v_purchase_1,
      v_premium_hoodie,
      5,
      1000.00,
      5000.00
    ),

    -- Purchase 2
    (
      v_purchase_2,
      v_black_tshirt,
      100,
      520.00,
      52000.00
    ),
    (
      v_purchase_2,
      v_premium_hoodie,
      30,
      1000.00,
      30000.00
    ),
    (
      v_purchase_2,
      v_classic_dress,
      0.5263157895,
      950.00,
      500.00
    ),

    -- Purchase 3
    (
      v_purchase_3,
      v_canvas_bag,
      100,
      400.00,
      40000.00
    ),
    (
      v_purchase_3,
      v_classic_watch,
      30,
      600.00,
      18000.00
    );


  -- ============================================
  -- Sales
  -- ============================================

  insert into public.sales (
    id,
    business_id,
    sale_date,
    reference,
    shipping_revenue,
    delivery_cost,
    payment_fee,
    discount,
    total_revenue,
    notes
  )
  values
    (
      v_sale_1,
      v_business_id,
      '2026-08-22',
      'ORD-2001',
      120.00,
      70.00,
      30.00,
      50.00,
      2670.00,
      'Facebook order batch'
    ),
    (
      v_sale_2,
      v_business_id,
      '2026-08-24',
      'ORD-2002',
      180.00,
      100.00,
      45.00,
      0.00,
      3930.00,
      'Instagram order batch'
    ),
    (
      v_sale_3,
      v_business_id,
      '2026-08-27',
      'ORD-2003',
      120.00,
      70.00,
      35.00,
      30.00,
      2790.00,
      'Website order batch'
    ),
    (
      v_sale_4,
      v_business_id,
      '2026-08-30',
      'ORD-2004',
      240.00,
      130.00,
      55.00,
      0.00,
      5190.00,
      'Mixed product order'
    );


  -- ============================================
  -- Sale Items
  -- ============================================

  insert into public.sale_items (
    sale_id,
    product_id,
    quantity,
    unit_price,
    discount,
    total_price
  )
  values
    -- Sale 1
    (
      v_sale_1,
      v_black_tshirt,
      2,
      850.00,
      50.00,
      1650.00
    ),
    (
      v_sale_1,
      v_canvas_bag,
      1,
      750.00,
      0.00,
      750.00
    ),

    -- Sale 2
    (
      v_sale_2,
      v_classic_dress,
      2,
      1650.00,
      0.00,
      3300.00
    ),
    (
      v_sale_2,
      v_black_tshirt,
      1,
      850.00,
      50.00,
      800.00
    ),

    -- Sale 3
    (
      v_sale_3,
      v_premium_hoodie,
      1,
      1800.00,
      30.00,
      1770.00
    ),
    (
      v_sale_3,
      v_canvas_bag,
      1,
      750.00,
      0.00,
      750.00
    ),

    -- Sale 4
    (
      v_sale_4,
      v_classic_watch,
      1,
      2200.00,
      0.00,
      2200.00
    ),
    (
      v_sale_4,
      v_classic_dress,
      1,
      1650.00,
      0.00,
      1650.00
    ),
    (
      v_sale_4,
      v_black_tshirt,
      2,
      850.00,
      0.00,
      1700.00
    );


  -- ============================================
  -- Returns
  -- ============================================

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
  values
    (
      v_business_id,
      v_sale_3,
      v_premium_hoodie,
      1,
      'Size issue',
      1770.00,
      80.00,
      30.00,
      '2026-08-31',
      'Customer returned hoodie'
    ),
    (
      v_business_id,
      v_sale_4,
      v_black_tshirt,
      1,
      'Wrong size',
      850.00,
      60.00,
      20.00,
      '2026-08-31',
      'Partial return'
    );


  -- ============================================
  -- Expenses
  -- ============================================

  insert into public.expenses (
    business_id,
    category_id,
    product_id,
    description,
    amount,
    expense_date
  )
  values
    (
      v_business_id,
      v_packaging_category,
      v_black_tshirt,
      'Custom packaging for Black T-Shirts',
      1200.00,
      '2026-08-25'
    ),
    (
      v_business_id,
      v_delivery_category,
      v_classic_dress,
      'Additional delivery expense for dresses',
      900.00,
      '2026-08-26'
    ),
    (
      v_business_id,
      v_general_category,
      null,
      'Monthly internet and software expenses',
      4500.00,
      '2026-08-28'
    );


  -- ============================================
  -- Cost Allocations
  -- ============================================

  insert into public.cost_allocations (
    business_id,
    source_type,
    source_id,
    product_id,
    amount,
    allocation_method
  )
  values
    (
      v_business_id,
      'purchase',
      v_purchase_1,
      v_black_tshirt,
      4200.00,
      'proportional_to_item_value'
    ),
    (
      v_business_id,
      'purchase',
      v_purchase_1,
      v_classic_dress,
      2700.00,
      'proportional_to_item_value'
    ),
    (
      v_business_id,
      'purchase',
      v_purchase_1,
      v_premium_hoodie,
      600.00,
      'proportional_to_item_value'
    ),
    (
      v_business_id,
      'purchase',
      v_purchase_2,
      v_black_tshirt,
      2500.00,
      'proportional_to_item_value'
    ),
    (
      v_business_id,
      'purchase',
      v_purchase_2,
      v_premium_hoodie,
      2500.00,
      'proportional_to_item_value'
    ),
    (
      v_business_id,
      'purchase',
      v_purchase_3,
      v_canvas_bag,
      1500.00,
      'proportional_to_item_value'
    ),
    (
      v_business_id,
      'purchase',
      v_purchase_3,
      v_classic_watch,
      1000.00,
      'proportional_to_item_value'
    );

end $$;