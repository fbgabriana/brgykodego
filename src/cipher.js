class Cipher {

	constructor(salt) {
		this.salt = salt || this.randomString();
		this.applySaltTo = num => this.textToChars(this.salt).reduce((a, b) => a ^ b, num);
		this.textToChars = str => str.split("").map(c => c.charCodeAt(0) * 5);
		this.charsToText = num => String.fromCharCode(num / 5);
		this.intToHexTri = int => ("0" + Number(int).toString(36)).slice(-2);
		this.hexTriToInt = hex => parseInt(hex, 36);
	}

	encrypt(uncoded) {
		return uncoded
		.split("")
		.map(this.textToChars)
		.map(this.applySaltTo)
		.map(this.intToHexTri)
		.join("")
		.split("").reverse().join("");
	}

	decrypt(encoded) {
		return encoded
		.split("").reverse().join("")
		.match(/.{1,2}/g)
		.map(this.hexTriToInt)
		.map(this.applySaltTo)
		.map(this.charsToText)
		.join("");
	}

	numencrypt(int) {
		return this.intToHexTri(this.applySaltTo(int))
	}

	numdecrypt(str) {
		return this.applySaltTo(this.hexTriToInt(str))
	}

	randomString() {
		return Math.random().toString(36).slice(2);
	}
}

module.exports = new Cipher();

