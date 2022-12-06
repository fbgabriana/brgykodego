//	mysql://b3586d55d10fcd:58b7911c@us-cdbr-east-06.cleardb.net/heroku_59c42b4c871f3a7?reconnect=true
//	mysql --host=us-cdbr-east-06.cleardb.net --user=b3586d55d10fcd --password=58b7911c --reconnect heroku_59c42b4c871f3a7
const cleardb_config = {
	username: "b3586d55d10fcd",
	password: "58b7911c",
	hostname: "us-cdbr-east-06.cleardb.net",
	database: "heroku_59c42b4c871f3a7"
};

//	mysql --localhost --user=nodepages --password=password --reconnect barangay
const localdb_config = {
	username: "nodepages",
	password: "password",
	hostname: "localhost",
	database: "barangay"
};

const db_config = (process.env.HOME === "/app") ? cleardb_config : localdb_config;
console.log(db_config)

module.exports = db_config;

