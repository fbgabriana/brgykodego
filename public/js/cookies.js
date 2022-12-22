// cookieStorage

var cookieStorage = {
	getItem (sKey) {
		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	},
	setItem (sKey="", sValue="", vEnd, sPath, sDomain="", sSame="Lax", bSecure=false) {
		if (!sKey || /^(?:expires|max\-age|path|domain|SameSite|secure)$/i.test(sKey)) return;
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
			default:
			}
		}
		if (sSame.toLowerCase() == `none`) bSecure = true;
		sKey    = `${encodeURIComponent(sKey)}=`;
		sValue  = `${encodeURIComponent(sValue)}`;
		sPath   = sPath   ? `; path=${sPath}` : ``;
		sDomain = sDomain ? `; domain=${sDomain}` : ``;
		sSame   = sSame   ? `; SameSite=${sSame}` : ``;
		bSecure = bSecure ? `; secure` : ``;
		return document.cookie = `${sKey}${sValue}${sExpires}${sDomain}${sPath}${sSame}${bSecure}`;
	},
	removeItem (sKey, sPath, sDomain, sSame="Lax", bSecure=false) {
		if (!sKey || !this.hasItem(sKey)) return;
		let sExpires = `; expires=${new Date(0).toUTCString()}`;
		if (sSame.toLowerCase() == `none`) bSecure = true;
		sKey    = `${encodeURIComponent(sKey)}=`;
		sPath   = sPath   ? `; path=${sPath}` : ``;
		sDomain = sDomain ? `; domain=${sDomain}` : ``;
		sSame   = sSame   ? `; SameSite=${sSame}` : ``;
		document.cookie = `${sKey}${sExpires}${sDomain}${sPath}${sSame}`;
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

