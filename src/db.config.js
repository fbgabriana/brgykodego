//	mysql://b3586d55d10fcd:58b7911c@us-cdbr-east-06.cleardb.net/heroku_59c42b4c871f3a7?reconnect=true
//	mysql --host=us-cdbr-east-06.cleardb.net --user=b3586d55d10fcd --password=58b7911c --reconnect heroku_59c42b4c871f3a7
const cleardb_config = {
	user: "b3586d55d10fcd",
	host: "us-cdbr-east-06.cleardb.net",
	password: "58b7911c",
	database: "heroku_59c42b4c871f3a7"
};

//	mysql --localhost --user=nodepages --password=password --reconnect barangay
const localdb_config = {
	user: "nodepages",
	host: "localhost",
	password: "password",
	database: "barangay"
};

module.exports = localdb_config;
