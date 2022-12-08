const bcrypt = require("bcrypt");

class User {
	constructor(username, password, hash) {
		this.name = username;
		this.pass = password;
		this.hash = hash;
	}
}

class Auth {

	constructor(rounds) {
		this.saltRounds = 10;
	}

	hashPassword(pass) {
		return bcrypt.hash(pass, this.saltRounds).then(hash => {
			// Store hash in the database
			return hash;
		})
		.catch(err => {
			console.log(err.message);
		})
	}

	comparePassword(pass, hash) {
		return bcrypt.compare(pass, hash).then(result => {
			return result;
		})
		.catch(err => {
			console.log(err.message);
		})
	}
}

module.exports = new Auth();

