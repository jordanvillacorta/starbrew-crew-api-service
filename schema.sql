-- Create the users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,         -- Auto-incrementing unique identifier for each user
    username VARCHAR(50) NOT NULL UNIQUE, -- Username, must be unique
    email VARCHAR(100) NOT NULL UNIQUE,   -- Email, must be unique
    password_hash VARCHAR(255) NOT NULL,  -- Hash of the user password for secure authentication
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp when the user was created
);

-- Create the shops table
CREATE TABLE shops (
    shop_id SERIAL PRIMARY KEY,        -- Auto-incrementing unique identifier for each shop
    name VARCHAR(100) NOT NULL,        -- Name of the coffee shop
    address VARCHAR(255) NOT NULL,     -- Address of the shop
    city VARCHAR(50) NOT NULL,         -- City where the shop is located
    state VARCHAR(50) NOT NULL,        -- State where the shop is located
    postal_code VARCHAR(20) NOT NULL,  -- Postal code
    latitude DECIMAL(10, 8),           -- Latitude for geolocation (optional for mapping)
    longitude DECIMAL(11, 8),          -- Longitude for geolocation (optional for mapping)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp when the shop was added to the database
);

-- Create the favorites table to manage the many-to-many relationship
CREATE TABLE favorites (
    favorite_id SERIAL PRIMARY KEY,  -- Unique identifier for each favorite relationship
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,  -- References the user who marked the shop as favorite
    shop_id INT REFERENCES shops(shop_id) ON DELETE CASCADE,  -- References the shop marked as favorite
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp when the shop was added to the favorites
);

-- Optional: Create a reviews table for users to review shops
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,      -- Auto-incrementing unique identifier for each review
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE, -- User who wrote the review
    shop_id INT REFERENCES shops(shop_id) ON DELETE CASCADE, -- Shop being reviewed
    rating INT CHECK (rating >= 1 AND rating <= 5), -- Rating out of 5 stars
    review_text TEXT,                  -- Optional review text
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Date the review was created
);

-- Create the shop_photos table for users to upload photos of coffee shops
CREATE TABLE shop_photos (
    photo_id SERIAL PRIMARY KEY,       -- Unique identifier for each photo
    shop_id INT REFERENCES shops(shop_id) ON DELETE CASCADE, -- References the coffee shop
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL, -- References the user who uploaded the photo, NULL if user is deleted
    photo_url VARCHAR(255) NOT NULL,   -- URL or file path where the photo is stored
    description TEXT,                  -- Optional description of the photo
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp when the photo was uploaded
);

-- Optional: Create an index to optimize search queries for shops by location
CREATE INDEX idx_shops_location
ON shops (city, state, postal_code);
