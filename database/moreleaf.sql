-- =============================================
-- MORELEAF DATABASE
-- =============================================

CREATE DATABASE IF NOT EXISTS moreleaf_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE moreleaf_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  phone VARCHAR(20),
  avatar VARCHAR(255),
  is_blocked BOOLEAN DEFAULT FALSE,
  otp VARCHAR(10),
  otp_expires DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  composition TEXT,
  benefits TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  image VARCHAR(255),
  sold INT DEFAULT 0,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  province VARCHAR(100),
  city VARCHAR(100),
  postal_code VARCHAR(10),
  address TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Carts Table
CREATE TABLE IF NOT EXISTS carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  total_price DECIMAL(12,2) NOT NULL,
  status ENUM('pending','diproses','dikemas','dikirim','selesai','dibatalkan') DEFAULT 'pending',
  payment_method ENUM('cod','transfer','qris') NOT NULL,
  recipient_name VARCHAR(100),
  recipient_phone VARCHAR(20),
  recipient_address TEXT,
  recipient_province VARCHAR(100),
  recipient_city VARCHAR(100),
  recipient_postal VARCHAR(10),
  notes TEXT,
  voucher_code VARCHAR(50),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT,
  product_name VARCHAR(150),
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  admin_reply TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  admin_reply TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  type ENUM('order','review','contact','user') DEFAULT 'order',
  is_read BOOLEAN DEFAULT FALSE,
  reference_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vouchers Table
CREATE TABLE IF NOT EXISTS vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type ENUM('percent','fixed') DEFAULT 'percent',
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  max_use INT DEFAULT 100,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expired_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SEED DATA
-- =============================================

-- Admin User (password: admin123)
INSERT INTO users (name, email, password, role, phone) VALUES
('Admin Moreleaf', 'admin@moreleaf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '081615980113');

-- Categories
INSERT INTO categories (name) VALUES
('Muffin'),
('Cookies'),
('Brownies');

-- Products
INSERT INTO products (category_id, name, description, composition, benefits, price, stock, sold) VALUES
(1, 'Choco Muffin Original', 'Muffin coklat lembut berbahan dasar daun kelor organik dengan cita rasa original yang menggugah selera. Perpaduan sempurna antara kelezatan dan nutrisi.', 'Tepung terigu, daun kelor organik, coklat bubuk, telur, butter, gula, baking powder, susu', 'Kaya zat besi dari daun kelor, tinggi protein, mengandung antioksidan dari coklat, cocok untuk semua kalangan', 7000, 50, 120),
(1, 'Choco Muffin Triple Choco', 'Sensasi tiga lapis coklat dalam satu muffin bernutrisi dengan kandungan daun kelor organik. Untuk para pencinta coklat sejati!', 'Tepung terigu, daun kelor organik, dark chocolate, milk chocolate, white chocolate chips, telur, butter, gula', 'Kaya zat besi, tinggi protein, mengandung flavonoid dari coklat hitam, sumber energi alami', 7000, 45, 95),
(1, 'Choco Muffin Butterscotch', 'Muffin dengan aroma butterscotch yang harum dan rasa karamel yang lembut, diperkaya dengan nutrisi daun kelor organik pilihan.', 'Tepung terigu, daun kelor organik, butterscotch chips, butter, brown sugar, telur, vanilla, baking powder', 'Kaya zat besi, tinggi kalsium, mengandung protein nabati dari daun kelor, cocok untuk anak-anak', 7000, 40, 80),
(2, 'Moreleaf Cookies', 'Cookies renyah berbahan dasar daun kelor organik dengan chocolate chips premium. Camilan sehat yang tidak mengorbankan kelezatan!', 'Tepung terigu, daun kelor organik, chocolate chips, butter, gula, telur, vanilla, baking soda, garam', 'Kaya zat besi dan kalsium, tinggi vitamin C dari daun kelor, sumber serat alami, cocok untuk vegetarian', 7000, 100, 200),
(3, 'Brownies Keju', 'Brownies lembut dengan taburan keju yang gurih, diperkaya kandungan nutrisi daun kelor organik. Perpaduan manis dan gurih yang sempurna!', 'Tepung terigu, daun kelor organik, coklat batang, keju cheddar, butter, telur, gula, baking powder', 'Kaya protein dari keju dan kelor, tinggi kalsium, mengandung zat besi, sumber energi', 4000, 80, 150),
(3, 'Brownies Coklat', 'Brownies coklat klasik dengan sentuhan daun kelor organik yang memberikan nutrisi ekstra tanpa mengubah cita rasa coklat yang kaya.', 'Tepung terigu, daun kelor organik, dark chocolate, butter, telur, gula pasir, coklat bubuk, vanilla', 'Mengandung antioksidan tinggi, kaya zat besi dan protein, mendukung kesehatan jantung, cocok untuk semua usia', 4000, 75, 180),
(3, 'Brownies Mix (Keju & Coklat)', 'Nikmati dua kelezatan dalam satu brownies! Paduan sempurna rasa keju gurih dan coklat manis dengan kandungan daun kelor organik.', 'Tepung terigu, daun kelor organik, dark chocolate, keju cheddar, butter, telur, gula, vanilla, baking powder', 'Kaya protein ganda dari keju dan kelor, tinggi kalsium dan zat besi, mengandung vitamin C, sempurna untuk keluarga', 4000, 60, 130);

-- Update ratings
UPDATE products SET rating_avg = 4.8, rating_count = 45 WHERE id = 1;
UPDATE products SET rating_avg = 4.9, rating_count = 38 WHERE id = 2;
UPDATE products SET rating_avg = 4.7, rating_count = 32 WHERE id = 3;
UPDATE products SET rating_avg = 4.9, rating_count = 78 WHERE id = 4;
UPDATE products SET rating_avg = 4.8, rating_count = 55 WHERE id = 5;
UPDATE products SET rating_avg = 4.7, rating_count = 62 WHERE id = 6;
UPDATE products SET rating_avg = 4.9, rating_count = 48 WHERE id = 7;

-- Sample Reviews
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
(1, 4, 5, 'Cookies-nya enak banget! Renyah dan tidak terasa pahit meskipun ada daun kelornya. Anak-anak saya suka!'),
(1, 1, 5, 'Muffin-nya lembut sekali, coklat-nya pas tidak terlalu manis. Senang bisa makan camilan sehat!'),
(1, 5, 4, 'Brownies kejunya enak, tapi agak sedikit keras. Overall tetap recommended untuk camilan sehat.');

-- Sample Voucher
INSERT INTO vouchers (code, discount_type, discount_value, min_purchase, max_use) VALUES
('MORELEAF10', 'percent', 10, 50000, 100),
('SEHAT20', 'fixed', 20000, 100000, 50);

DELIMITER //
CREATE TRIGGER IF NOT EXISTS update_product_rating
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
  UPDATE products 
  SET rating_avg = (SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id),
      rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;
END //
DELIMITER ;
