const fs = require("fs");
const mysql = require("mysql");

const callback = (err, result) => {
	if (err) { console.log(err.message) }
}

const dbconfig = require("./db.config.js");

const sql = mysql.createConnection({
	user: dbconfig.user,
	host: dbconfig.host,
	password: dbconfig.password,
	database: dbconfig.database
});

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

