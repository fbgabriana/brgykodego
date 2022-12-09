const util = require('util');
const exec = util.promisify(require('child_process').exec);
const dbconfig = require("./db.config.js");

const stdout = (process.platform == "win32") ? "type" : "cat";

const setup = async () => {
	if (! process.env.DATABASE_URL ) {
		await exec(`${stdout} src/sql/create-database.sql | mysql -u root`);
	}
	await exec(`${stdout} src/sql/create-tables.sql src/sql/populate-tables.sql | mysql --user=${dbconfig.user} --password=${dbconfig.password} --host=${dbconfig.host} --database=${dbconfig.database}`);
	require("./pages.js");
}

setup();
