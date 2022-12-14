#!/bin/sh
git all
src/sql/cleardb-mysql-setup.sh
heroku restart
heroku logs --tail

