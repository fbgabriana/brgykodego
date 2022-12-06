#!/bin/sh

user=b3586d55d10fcd
password=58b7911c
host=us-cdbr-east-06.cleardb.net
database=heroku_59c42b4c871f3a7

{
mysql="mysql --user=$user --password=$password --host=$host --reconnect $database"

echo "Generating tables..."
$mysql < create-tables.sql

echo "Populating tables..."
$mysql < populate-tables.sql

echo "Creating pages..."
export DATABASE_URL="mysql://$user:$password@$host/$database?reconnect=true"
npm run pages

} 2> /dev/null

