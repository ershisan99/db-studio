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
CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name VARCHAR(50));
INSERT INTO test_table (name) VALUES ('John Doe');
EOF

# Set up MySQL test data
docker exec -i db-mysql-test mysql -uroot -pmysecretpassword<<EOF
CREATE DATABASE IF NOT EXISTS test_db;
USE test_db;
CREATE TABLE IF NOT EXISTS test_table (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50));
INSERT INTO test_table (name) VALUES ('Jane Doe');
EOF

echo "Test databases are ready"
