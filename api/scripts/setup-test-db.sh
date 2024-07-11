#!/bin/bash

# Start Docker containers
docker-compose up -d

# Wait for PostgreSQL to be ready
until docker exec db-postgres-test pg_isready -U postgres; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

# Wait for MySQL to be ready
until docker exec db-mysql-test mysqladmin ping -h "localhost" --silent; do
  >&2 echo "MySQL is unavailable - sleeping"
  sleep 1
done

# Set up PostgreSQL test data
docker exec -i db-postgres-test psql -U postgres <<EOF
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  order_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  order_date DATE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE INDEX idx_orders_user_id ON orders(user_id);

INSERT INTO users (name) VALUES ('John Doe');
INSERT INTO users (name) VALUES ('Alice Smith');
INSERT INTO orders (user_id, order_date) VALUES (1, '2023-01-01');
INSERT INTO orders (user_id, order_date) VALUES (2, '2023-02-01');
EOF

# Set up MySQL test data
docker exec -i db-mysql-test mysql -uroot -pmysecretpassword<<EOF
CREATE DATABASE IF NOT EXISTS test_db;
USE test_db;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_date DATE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE INDEX idx_orders_user_id ON orders(user_id);

INSERT INTO users (name) VALUES ('Jane Doe');
INSERT INTO users (name) VALUES ('Bob Brown');
INSERT INTO orders (user_id, order_date) VALUES (1, '2023-03-01');
INSERT INTO orders (user_id, order_date) VALUES (2, '2023-04-01');
EOF

echo "Test databases are ready"
