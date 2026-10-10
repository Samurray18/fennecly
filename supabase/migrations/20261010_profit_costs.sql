-- Profit tracking: private cost data
-- Run in Supabase SQL Editor
--
-- IMPORTANT: these tables hold PRIVATE cost/profit data. Never join them into
-- public storefront query paths (products / orders / order_items selects).

CREATE TABLE IF NOT EXISTS product_costs (
  product_id uuid PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cost_price numeric(12,2) NOT NULL CHECK (cost_price >= 0),
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS order_costs (
  order_id uuid PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  delivery_cost numeric(12,2) DEFAULT 0 NOT NULL CHECK (delivery_cost >= 0),
  return_cost numeric(12,2) DEFAULT 0 NOT NULL CHECK (return_cost >= 0),
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  expense_date date DEFAULT current_date NOT NULL,
  category text NOT NULL CHECK (category IN ('ads', 'packaging', 'salary', 'rent', 'software', 'other')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  note text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS order_costs_store_idx ON order_costs(store_id);
CREATE INDEX IF NOT EXISTS expenses_store_date_idx ON expenses(store_id, expense_date);

ALTER TABLE product_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON product_costs FROM anon;
REVOKE ALL ON order_costs FROM anon;
REVOKE ALL ON expenses FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON product_costs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON order_costs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON expenses TO authenticated;

GRANT ALL ON product_costs TO service_role;
GRANT ALL ON order_costs TO service_role;
GRANT ALL ON expenses TO service_role;

CREATE POLICY "product_costs_own" ON product_costs
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_costs.product_id
        AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "order_costs_own" ON order_costs
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_costs.order_id
        AND orders.store_owner_id = auth.uid()
    )
  );

CREATE POLICY "expenses_own" ON expenses
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = expenses.store_id
        AND stores.owner_id = auth.uid()
    )
  );
