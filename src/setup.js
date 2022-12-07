const exec = require('child_process').exec;

const stdout = (process.platform == "win32") ? "type" : "cat";

const setup = async () => {
	console.log("\nCreating database:");
	await exec(`${stdout} src/sql/create-database.sql src/sql/create-tables.sql src/sql/populate-tables.sql | mysql -u root`);
	require("./pages.js");
}

setup();
