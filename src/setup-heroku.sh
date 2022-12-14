#!/bin/sh
cd "src/sql"
git all
cleardb-mysql-setup.sh
heroku restart
heroku logs --tail

