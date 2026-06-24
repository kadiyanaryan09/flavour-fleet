-- Flavour Fleet — multi-restaurant marketplace schema (Zomato/Swiggy-style)
-- Run once against MySQL to create the database structure.

CREATE DATABASE IF NOT EXISTS flavour_fleet
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE flavour_fleet;

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  is_admin TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Saved delivery addresses (a user can have several; one default)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  label VARCHAR(40) DEFAULT 'Home',
  line1 VARCHAR(200) NOT NULL,
  line2 VARCHAR(200) DEFAULT '',
  city VARCHAR(80) NOT NULL,
  state VARCHAR(80) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_address_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- Restaurants
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  cuisine VARCHAR(120) NOT NULL,
  description VARCHAR(500) DEFAULT '',
  image_url VARCHAR(500) DEFAULT NULL,
  city VARCHAR(80) NOT NULL DEFAULT 'Meerut',
  area VARCHAR(120) DEFAULT '',
  rating DECIMAL(2,1) NOT NULL DEFAULT 4.0,
  cost_for_two INT NOT NULL DEFAULT 300,
  delivery_time_min INT NOT NULL DEFAULT 25,
  delivery_time_max INT NOT NULL DEFAULT 35,
  discount_text VARCHAR(80) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Categories (food types — Pizza, Biryani, Thali, Desserts, ...)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  sort_order INT DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- Menu items (belong to one restaurant + one category)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(300) DEFAULT '',
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  is_veg TINYINT(1) NOT NULL DEFAULT 1,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_menuitem_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  CONSTRAINT fk_menuitem_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- Cart — persisted server-side, one active cart per user.
-- A user's cart can only hold items from ONE restaurant at a time (same
-- rule Zomato/Swiggy use), enforced in the application layer.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_menuitem FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  CONSTRAINT uq_cart_user_item UNIQUE (user_id, menu_item_id)
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  address_id INT DEFAULT NULL,
  delivery_address VARCHAR(400) NOT NULL,
  status ENUM('placed','confirmed','preparing','out_for_delivery','delivered','cancelled') NOT NULL DEFAULT 'placed',
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  gst_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL DEFAULT 'mock_card',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'paid',
  transaction_id VARCHAR(64) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_address FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------------
-- Order line items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NULL,
  item_name VARCHAR(150) NOT NULL,
  quantity INT NOT NULL,
  price_at_order DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_orderitem_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_orderitem_menuitem FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------------
-- Reviews — one per user per restaurant (resubmitting updates it)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  user_id INT NOT NULL,
  rating TINYINT NOT NULL,
  comment VARCHAR(500) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_review_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_review_user_restaurant UNIQUE (restaurant_id, user_id),
  CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1 AND 5)
);
