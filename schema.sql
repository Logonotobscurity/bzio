
CREATE TABLE categories (
  category_id VARCHAR(10) PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  category_slug VARCHAR(100) UNIQUE NOT NULL,
  icon_emoji VARCHAR(10),
  description TEXT,
  sort_order INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_slug (category_slug),
  INDEX idx_active (is_active)
);

CREATE TABLE companies (
  company_id VARCHAR(10) PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE brands (
  brand_id VARCHAR(10) PRIMARY KEY,
  brand_name VARCHAR(100) NOT NULL UNIQUE,
  brand_slug VARCHAR(100) UNIQUE NOT NULL,
  company_id VARCHAR(10) NOT NULL,
  logo_url VARCHAR(500),
  brand_description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(company_id),
  INDEX idx_company (company_id),
  INDEX idx_active (is_active)
);

CREATE TABLE products (
  product_id VARCHAR(64) PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  product_slug VARCHAR(255) UNIQUE NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  category_id VARCHAR(10) NOT NULL,
  brand_id VARCHAR(10) NOT NULL,
  company_id VARCHAR(10) NOT NULL,
  product_description TEXT,
  detailed_description TEXT,
  image_url VARCHAR(500),
  image_alt_text VARCHAR(255),
  cost_price_ngn DECIMAL(12,2) NOT NULL,
  bzion_wholesale_price_ngn DECIMAL(12,2) NOT NULL,
  bzion_bulk_price_10_ngn DECIMAL(12,2) NOT NULL,
  market_retail_price_ngn DECIMAL(12,2) NOT NULL,
  wholesale_margin_pct DECIMAL(5,2),
  profit_per_unit_ngn DECIMAL(12,2),
  savings_vs_retail_pct DECIMAL(5,2),
  quantity_in_stock INT DEFAULT 500,
  reorder_level INT DEFAULT 100,
  reorder_quantity INT DEFAULT 250,
  data_status ENUM('Active', 'Inactive', 'Discontinued') DEFAULT 'Active',
  data_quality_score INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(category_id),
  FOREIGN KEY (brand_id) REFERENCES brands(brand_id),
  FOREIGN KEY (company_id) REFERENCES companies(company_id),
  INDEX idx_category (category_id),
  INDEX idx_brand (brand_id),
  INDEX idx_status (data_status),
  INDEX idx_price (bzion_wholesale_price_ngn)
);

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title VARCHAR(255),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  INDEX idx_product (product_id),
  INDEX idx_rating (rating),
  INDEX idx_verified (is_verified_purchase)
);

CREATE TABLE cart_items (
  cart_id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(255),
  user_id INT,
  product_id VARCHAR(64) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price_ngn DECIMAL(12,2) NOT NULL,
  line_total_ngn DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price_ngn),
  bulk_discount_applied BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  INDEX idx_session (session_id),
  INDEX idx_user (user_id)
);

CREATE TABLE quote_requests (
  quote_id INT AUTO_INCREMENT PRIMARY KEY,
  quote_reference VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  requested_products JSON NOT NULL,
  total_items INT,
  estimated_total_ngn DECIMAL(12,2),
  status ENUM('Draft', 'Submitted', 'Under Review', 'Quoted', 'Rejected') DEFAULT 'Draft',
  status_changed_at TIMESTAMP,
  company_name VARCHAR(255),
  requestor_name VARCHAR(255),
  requestor_email VARCHAR(255),
  requestor_phone VARCHAR(20),
  delivery_address TEXT,
  quoted_price_ngn DECIMAL(12,2),
  quote_valid_until DATE,
  notes TEXT,
  source_page VARCHAR(100) DEFAULT 'product_page',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);

CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  order_reference VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  quote_id INT,
  order_items JSON NOT NULL,
  total_items INT,
  total_amount_ngn DECIMAL(12,2),
  tax_ngn DECIMAL(12,2),
  shipping_cost_ngn DECIMAL(12,2),
  final_amount_ngn DECIMAL(12,2),
  status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
  tracking_number VARCHAR(100),
  estimated_delivery DATE,
  payment_method ENUM('Bank Transfer', 'Card', 'Wallet', 'Cash on Delivery'),
  payment_status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (quote_id) REFERENCES quote_requests(quote_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);

CREATE TABLE analytics_events (
  event_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id INT,
  session_id VARCHAR(255),
  product_id VARCHAR(64),
  category_id VARCHAR(10),
  brand_id VARCHAR(10),
  page_url VARCHAR(500),
  event_data JSON,
  user_agent VARCHAR(500),
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_type (event_type),
  INDEX idx_user (user_id),
  INDEX idx_product (product_id),
  INDEX idx_timestamp (timestamp)
);

CREATE TABLE dashboard_metrics (
  metric_id INT AUTO_INCREMENT PRIMARY KEY,
  metric_date DATE NOT NULL,
  total_orders_count INT,
  total_revenue_ngn DECIMAL(15,2),
  average_order_value_ngn DECIMAL(12,2),
  unique_visitors INT,
  total_page_views INT,
  product_views_count INT,
  quote_requests_count INT,
  top_selling_product_id VARCHAR(64),
  top_category_id VARCHAR(10),
  cart_additions INT,
  quote_conversion_rate DECIMAL(5,2),
  order_conversion_rate DECIMAL(5,2),
  last_calculated TIMESTAMP,
  PRIMARY KEY (metric_date),
  INDEX idx_date (metric_date)
);
