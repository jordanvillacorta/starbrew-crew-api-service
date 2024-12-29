-- First drop existing tables in reverse order of their dependencies
DROP TABLE IF EXISTS shop_photos CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS shops CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then execute the create statements from your schema.sql
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
    latitude DECIMAL(10, 8) CHECK (latitude BETWEEN -90 AND 90),  -- Latitude for geolocation, with valid range
    longitude DECIMAL(11, 8) CHECK (longitude BETWEEN -180 AND 180), -- Longitude for geolocation, with valid range
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp when the shop was added to the database
);

-- Create the favorites table to manage the many-to-many relationship
CREATE TABLE favorites (
    favorite_id SERIAL PRIMARY KEY,  -- Unique identifier for each favorite relationship
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,  -- References the user who marked the shop as favorite
    shop_id INT NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE,  -- References the shop marked as favorite
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the shop was added to the favorites
    CONSTRAINT unique_favorites UNIQUE (user_id, shop_id) -- Ensures a user can only favorite a shop once
);

-- Create the shop_photos table for users to upload photos of coffee shops
CREATE TABLE shop_photos (
    photo_id SERIAL PRIMARY KEY,       -- Unique identifier for each photo
    shop_id INT NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE, -- References the coffee shop
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL, -- References the user who uploaded the photo, NULL if user is deleted
    photo_url VARCHAR(255) NOT NULL,   -- URL or file path where the photo is stored
    description TEXT,                  -- Optional description of the photo
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp when the photo was uploaded
);

-- Add indexes to optimize search queries
CREATE INDEX idx_shops_location ON shops (city, state, postal_code); -- Optimize location-based searches
CREATE INDEX idx_favorites_user_id ON favorites (user_id); -- Optimize favorite lookups by user
CREATE INDEX idx_favorites_shop_id ON favorites (shop_id); -- Optimize favorite lookups by shop
