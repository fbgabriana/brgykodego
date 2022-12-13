const bcrypt = require("bcrypt");

class Auth {

	constructor(rounds) {
		this.saltRounds = 10;
	}

	hashPassword(pass) {
		return bcrypt.hash(pass, this.saltRounds).then(hash => {
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

