USE flavour_fleet;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  cuisine VARCHAR(120) NOT NULL,
  description VARCHAR(500) DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  city VARCHAR(80) NOT NULL DEFAULT 'Meerut',
  area VARCHAR(120) DEFAULT NULL,
  rating DECIMAL(2,1) NOT NULL DEFAULT 4.0,
  cost_for_two INT NOT NULL DEFAULT 300,
  delivery_time_min INT NOT NULL DEFAULT 25,
  delivery_time_max INT NOT NULL DEFAULT 35,
  discount_text VARCHAR(80) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_veg TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  sort_order INT DEFAULT 0
);

CREATE TABLE menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(500) DEFAULT '',
  price DECIMAL(10, 2) NOT NULL,
  emoji VARCHAR(8) DEFAULT '',
  is_available TINYINT(1) DEFAULT 1,
  CONSTRAINT fk_menu_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE CASCADE
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status ENUM('placed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'placed',
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_address VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NULL,
  item_name VARCHAR(150) NOT NULL,
  quantity INT NOT NULL,
  price_at_order DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_item_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_item_menu
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    ON DELETE SET NULL
);

SET FOREIGN_KEY_CHECKS = 1;
