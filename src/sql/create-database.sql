CREATE USER IF NOT EXISTS 'nodepages'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON * . * TO 'nodepages'@'localhost';
CREATE database IF NOT EXISTS barangay;
use barangay;
