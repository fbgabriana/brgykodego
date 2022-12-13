// Cookie Jar

var cookieStorage = {
	getItem (sKey) {
		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	},
	setItem (sKey, sValue, vEnd, sPath, sDomain, sSameSite, bSecure) {
		if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
		let sExpires = ``;
		if (vEnd) {
			switch (vEnd.constructor) {
			case Number:
				sExpires = vEnd === Infinity ? `; expires=${new Date(-1).toUTCString()}` : `; max-age=${vEnd}`;
				break;
			case String:
				sExpires = `; expires=${vEnd}`;
				break;
			case Date:
				sExpires = `; expires=${vEnd.toUTCString()}`;
				break;
			}
		}
		if (sSameSite && (sSameSite.toLowerCase() == `none`)) bSecure = true;
		sDomain = sDomain ? `; domain=${sDomain}` : ``;
		sPath   = sPath   ? `; path=${sPath}` : ``;
		bSecure = bSecure ? `; secure` : ``;
		document.cookie = `${encodeURIComponent(sKey)}=${encodeURIComponent(sValue)}${sExpires}${sDomain}${sPath}; SameSite=${sSameSite || "Lax"}${bSecure}`;
		return sKey;
	},
	removeItem (sKey, sPath, sDomain) {
		if (!sKey || !this.hasItem(sKey)) return;
		sDomain = sDomain ? `; domain=${sDomain}` : ``;
		sPath   = sPath   ? `; path=${sPath}` : ``;
		document.cookie = `${encodeURIComponent(sKey)}=; expires=${new Date(0).toUTCString()}${sDomain}${sPath}; SameSite=Lax`;
		return;
	},
	hasItem (sKey) {
		return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	},
	items () {
		let aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
		return aKeys.map(decodeURIComponent);
	},
	key (nIdx) {
		return this.items()[nIdx];
	},
	clear () {
		return this.items().map(sKey => {this.removeItem(sKey)})[0];
	},
};

