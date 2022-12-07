test -d node_modules && rm -rf node_modules package-lock.json && mysql -u root < src/sql/remove-database.sql || echo Nothing to do.
