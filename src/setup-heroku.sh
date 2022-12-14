#!/bin/sh
cd "src/sql"
git all
sh cleardb-mysql-setup.sh
heroku restart
heroku logs --tail

