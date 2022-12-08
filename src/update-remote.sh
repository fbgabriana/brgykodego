#!/bin/sh

driver=mysql
user=b3586d55d10fcd
password=58b7911c
host=us-cdbr-east-06.cleardb.net
database=heroku_59c42b4c871f3a7

export DATABASE_URL="$driver://$user:$password@$host/$database?reconnect=true"
npm run pages

