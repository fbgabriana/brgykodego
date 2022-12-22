
const querystring = {
	parse : (str="", sep="&", eq="=") => {
		let query = Object.create(null);
		if (str != null && str.constructor === String) {
			if (str[0] === "?") str = str.slice(1);
			let pairs = str ? str.split(sep) : [];
			for (let i = 0; i < pairs.length; i++) {
				let pair = pairs[i].split(eq);
				query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
			}
		} else return str;
		return query;
	}
}

module.exports = querystring;

