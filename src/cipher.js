class Cipher {

	constructor(salt) {
		this.salt = salt || this.randomString();
		this.applySaltTo = num => this.textToChars(this.salt).reduce((a, b) => a ^ b, num);
		this.textToChars = str => str.split("").map(c => c.charCodeAt(0) * 15);
		this.charsToText = num => String.fromCharCode(num / 15);
		this.intToBase62 = int => this.encode62(int).slice(-2);
		this.base62ToInt = hex => this.decode62(hex);
		this.charset = "0123456789aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ";
	}

	encrypt(string) {
		return string
		.split("")
		.map(this.textToChars)
		.map(this.applySaltTo)
		.map(this.intToBase62)
		.join("")
		.split("").reverse().join("");
	}

	decrypt(string) {
		return string
		.split("").reverse().join("")
		.match(/.{1,2}/g)
		.map(this.base62ToInt)
		.map(this.applySaltTo)
		.map(this.charsToText)
		.join("");
	}

	encode62 (int) {
		let s = [];
		while (int > 0) {
			s = [this.charset[int % 62], ...s];
			int = parseInt(int / 62);
		}
		return "0" + s.join("");
	}

	decode62 (chars) {
		return chars.split("").reverse().reduce((prev, curr, i) => prev + (this.charset.indexOf(curr) * (62 ** i)), 0);
	}

	randomString () {
		return Math.random().toString(36).slice(2);
	}

}

module.exports = new Cipher();

/*

// Example:

const cipher = new Cipher();

cipher.salt = cipher.randomString();

let string = "Hello, world!";
let encrypted = cipher.encrypt(string);
let decrypted = cipher.decrypt(encrypted);

console.log(string);
console.log(cipher.salt);
console.log(encrypted);
console.log(decrypted);

let number = parseInt(Math.random() * 10000000000000);
let encoded = cipher.encode62(number);
let decoded = cipher.decode62(encoded);

console.log(number);
console.log(encoded);
console.log(decoded);

console.log(number==decoded && string==decrypted);

*/

