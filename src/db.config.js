const path = require('path');
const parseDbUrl = require("parse-database-url");

const localdb = {"DATABASE_URL":"mysql://nodepages:password@localhost/barangay"};
const dbconfig = parseDbUrl(process.env.DATABASE_URL || localdb.DATABASE_URL);

process.stdout.write(`${path.parse(module.filename).name}: `);
console.log(JSON.parse(JSON.stringify(dbconfig)))

module.exports = dbconfig;

