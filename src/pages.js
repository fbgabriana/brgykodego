const fs = require("fs");
const mysql = require("mysql");

const callback = (err, result) => {
	if (err) { console.log(err.message) }
}

const sql = mysql.createConnection({
	user: "nodepages",
	host: "localhost",
	password: "password"
}, callback);

switch (process.argv[2]) {
case "create":

	sql.connect(callback);
	sql.query("CREATE DATABASE IF NOT EXISTS barangay", callback);
	sql.query("USE barangay", callback);
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
	sql.connect(callback);
	sql.query("DROP DATABASE IF EXISTS barangay", callback);
	sql.end();
	break;
default:
	console.log("sitedb.js: invalid argument");
	process.exit(1);
}

