const mysql = require("mysql");
const dbconfig = require("./db.config.js");

const sql = mysql.createConnection({
	user: dbconfig.user,
	host: dbconfig.host,
	password: dbconfig.password,
	database: dbconfig.database
});

module.exports = sql;
