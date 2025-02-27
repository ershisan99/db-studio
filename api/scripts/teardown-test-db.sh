#!/bin/bash

# Clean up PostgreSQL test data
docker exec -i db-postgres-test psql -U postgres <<EOF
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS orders;
EOF

# Clean up MySQL test data
docker exec -i db-mysql-test mysql -uroot -pmysecretpassword --database=test_db<<EOF
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS orders;
EOF

# Stop and remove Docker containers and volumes
docker-compose down -v

echo "Test databases are cleaned up"
