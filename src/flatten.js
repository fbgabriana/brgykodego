const flatten = (obj = [], path = "") => {
	if (typeof obj === "object") {
		return Object.keys(obj).reduce((output, key) => {
			return {...output, ...flatten(obj[key], key)};
		}, {});
	} else {
		return { [path] : obj };
	}
}

module.exports = flatten;
