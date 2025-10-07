-- Create databases for microservices
-- This script runs automatically when PostgreSQL container starts

-- Create databases for each microservice
-- Note: These will error if databases already exist during container restart, but that's expected in development
CREATE DATABASE auth_service_db;
CREATE DATABASE user_service_db;
CREATE DATABASE product_service_db;
CREATE DATABASE cart_service_db;
CREATE DATABASE order_service_db;
CREATE DATABASE warranty_service_db;
CREATE DATABASE notification_service_db;
CREATE DATABASE blog_service_db;
CREATE DATABASE report_service_db;

-- Create users for each service (optional - can use default postgres user)
-- CREATE USER auth_user WITH ENCRYPTED PASSWORD 'auth_password';
-- CREATE USER user_user WITH ENCRYPTED PASSWORD 'user_password';
-- CREATE USER product_user WITH ENCRYPTED PASSWORD 'product_password';
-- CREATE USER cart_user WITH ENCRYPTED PASSWORD 'cart_password';
-- CREATE USER order_user WITH ENCRYPTED PASSWORD 'order_password';
-- CREATE USER warranty_user WITH ENCRYPTED PASSWORD 'warranty_password';
-- CREATE USER blog_user WITH ENCRYPTED PASSWORD 'blog_password';
-- CREATE USER report_user WITH ENCRYPTED PASSWORD 'report_password';

-- Grant permissions (if using separate users)
-- GRANT ALL PRIVILEGES ON DATABASE auth_service_db TO auth_user;
-- GRANT ALL PRIVILEGES ON DATABASE user_service_db TO user_user;
-- GRANT ALL PRIVILEGES ON DATABASE product_service_db TO product_user;
-- GRANT ALL PRIVILEGES ON DATABASE cart_service_db TO cart_user;
-- GRANT ALL PRIVILEGES ON DATABASE order_service_db TO order_user;
-- GRANT ALL PRIVILEGES ON DATABASE warranty_service_db TO warranty_user;
-- GRANT ALL PRIVILEGES ON DATABASE blog_service_db TO blog_user;
-- GRANT ALL PRIVILEGES ON DATABASE report_service_db TO report_user;

-- For now, using default postgres user for all databases
-- This is simpler for development environment

-- Verify databases were created
SELECT datname FROM pg_database WHERE datistemplate = false;