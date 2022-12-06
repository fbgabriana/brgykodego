#!/bin/sh

mysql="mysql --host=us-cdbr-east-06.cleardb.net --user=b3586d55d10fcd --password=58b7911c --reconnect heroku_59c42b4c871f3a7"
$mysql < create-tables.sql
$mysql < populate-tables.sql

