-- Database Performance Optimization Indexes
-- These indexes should be created on the production database for optimal performance

-- Product table indexes
CREATE INDEX IF NOT EXISTS idx_products_deleted ON products(is_deleted);
CREATE INDEX IF NOT EXISTS idx_products_homepage ON products(show_on_homepage) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(retail_price);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku) WHERE is_deleted = false;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_active_homepage ON products(is_deleted, show_on_homepage, created_at)
WHERE is_deleted = false AND show_on_homepage = true;

CREATE INDEX IF NOT EXISTS idx_products_active_featured ON products(is_deleted, is_featured, created_at)
WHERE is_deleted = false AND is_featured = true;

CREATE INDEX IF NOT EXISTS idx_products_price_range ON products(retail_price, is_deleted, created_at)
WHERE is_deleted = false;

-- Full-text search indexes (PostgreSQL specific)
CREATE INDEX IF NOT EXISTS idx_products_fulltext ON products
USING gin(to_tsvector('english', name || ' ' || COALESCE(short_description, '')))
WHERE is_deleted = false;

-- Cart table indexes
CREATE INDEX IF NOT EXISTS idx_dealer_carts_dealer ON dealer_carts(id_dealer);
CREATE INDEX IF NOT EXISTS idx_dealer_carts_product ON dealer_carts(id_product);
CREATE INDEX IF NOT EXISTS idx_dealer_carts_created ON dealer_carts(created_at);

-- Order tables indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_item_details(id_order);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_item_details(id_order_item);

-- User related indexes
CREATE INDEX IF NOT EXISTS idx_accounts_username ON accounts(username);
CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
CREATE INDEX IF NOT EXISTS idx_dealers_company ON dealers(company_name);

-- Blog indexes
CREATE INDEX IF NOT EXISTS idx_blogs_category ON category_blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_created ON category_blogs(created_at);
CREATE INDEX IF NOT EXISTS idx_blogs_deleted ON category_blogs(is_deleted);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Performance monitoring queries
-- Use these to monitor index usage and query performance

-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;

-- Check table scan statistics
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;

-- Check query performance (requires pg_stat_statements extension)
-- SELECT query, calls, total_time, mean_time, rows
-- FROM pg_stat_statements
-- ORDER BY total_time DESC
-- LIMIT 10;