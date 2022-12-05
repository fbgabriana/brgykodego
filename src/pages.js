const fs = require("fs");
const mysql = require("mysql");

const callback = (err, result) => {
	if (err) { console.log(err.message) }
}

const sql = require("./db.js");
const dbconfig = require("./db.config.js");

switch (process.argv[2]) {
case "create":

//	sql.connect(callback);
//	sql.query(`CREATE DATABASE IF NOT EXISTS ${dbconfig.database}`, callback);
//	sql.query(`USE ${dbconfig.database}`, callback);
	sql.query("CREATE TABLE IF NOT EXISTS pages( \
		id VARCHAR(16) UNIQUE NOT NULL, \
		title VARCHAR(1024) NOT NULL, \
		content TEXT NOT NULL, \
		PRIMARY KEY(id))",
	callback);

	const pages = require("./pages.json");
	const pagespath = "./src/pages";

	for (let [id, title] of Object.entries(pages)) {
		console.log(`Creating ${title}...`);
		let content = fs.readFileSync(`${pagespath}/${id}`).toString();
		sql.query(`REPLACE INTO pages (id, title, content) VALUES ('${id}','${title}','${content}')`, callback);
	}

	console.log("Done.");
	sql.end();
	break;

case "remove":
//	sql.connect(callback);
//	sql.query(`DROP DATABASE IF EXISTS ${dbconfig.database}`, callback);
	sql.end();
	break;
default:
	console.log("sitedb.js: invalid argument");
	process.exit(1);
}

