auth.require();

const messages = {
	getMessages() {
		const message_table = document.querySelector(".message-table");
		fetch("/get?messages").then(res => res.json()).then(messages => {
			let table = document.createElement("table");
			let tr = document.createElement("tr");
			for (tableheader in messages[0]) {
				let th = document.createElement("th");
				th.innerText = tableheader;
				tr.appendChild(th);
			}
			table.appendChild(tr)
			for (tablerow of messages) {
				let tr = document.createElement("tr");
				for (tabledata in tablerow) {
					let td = document.createElement("td");
					td.innerText = tablerow[tabledata];
					tr.appendChild(td);
				}
				table.appendChild(tr)
			}
			message_table.replaceChildren(table);
		});
	}
}

const prefs = {

	getColors (event) {
		const colorcode = document.getElementById("colorcode");
		const colorpicker = document.getElementById("colorpicker");
		const colorchanger = document.getElementById("colorchanger");
		const colortheme = sessionStorage.getItem("colortheme");

		colorcode.value = colortheme;
		colorpicker.value = colortheme;

		fetch("/prefs?colortheme").then(res => res.json()).then(brgy_colors_hsl => {
			colorcode.value = brgy_colors_hsl.rgb_hex;
			colorpicker.value = brgy_colors_hsl.rgb_hex;
			sessionStorage.setItem("colortheme", colorcode.value)
		});

		let rgb = HEXtoRGB(colorcode.value);
		let hsl = RGBtoHSL(rgb);
		let hex = RGBtoHEX(rgb);
		//console.log(rgb, hsl, hex);

		colorpicker.addEventListener("change", event => {
			colorcode.value = colorpicker.value;
		});
		colorcode.addEventListener("change", event => {
			if (colorcode.value.match(/^#[0-9a-f]{6}/i)) {
				colorpicker.value = colorcode.value;
			}
		});
		colorcode.addEventListener("input", event => {
			if (colorcode.value.match(/^#[0-9a-f]{6}/i)) {
				colorpicker.value = colorcode.value;
			}
		});
		colorchanger.addEventListener("click", this.setColors);
	},

	setColors (event) {
		event.preventDefault();
		const colorcode = document.getElementById("colorcode");
		const colorpicker = document.getElementById("colorpicker");
		const colorchanger = document.getElementById("colorchanger");
		const colortheme = sessionStorage.getItem("colortheme");

		const rgb = HEXtoRGB(colorcode.value);
		const hsl = RGBtoHSL(rgb);

		const id = (event.target.id === "colorchanger") ? 1 : 0;

		if (typeof hsl.h === "undefined") {
			alert("Invalid input");
			colorpicker.value = colorcode.value = colortheme;
		} else if (isNaN(hsl.h)) {
			alert("Hue is undefined");
			colorpicker.value = colorcode.value = colortheme;
		} else {
			sessionStorage.setItem("colortheme", colorcode.value)
			document.body.style.cursor = colorchanger.style.cursor = "progress";
			const req = new XMLHttpRequest();
			req.open("POST", "/prefs?colortheme", true);
			req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			req.send(`hue_id=${id}&hsl_hue=${hsl.h}&hsl_saturation=${hsl.s}&hsl_lightness=${hsl.l}&rgb_hex=${colorcode.value}`);
			setTimeout(() => {
				location.reload(true);
			}, 360);
		}
	}
}

const RGBtoHEX = rgb => {
	const hex = dec => Math.round(dec + Number.EPSILON).toString(16).padStart(2, "0");
	return `#${hex(rgb.r)}${hex(rgb.g)}${hex(rgb.b)}`;
}
const HEXtoRGB = hex => {
	let rgb = Object.create(null);
	if (hex[0] == "#") {
		let [R,G,B] = [];
		if (hex.length == 4) {
			R = `0x${hex[1]}${hex[1]}`;
			G = `0x${hex[2]}${hex[2]}`;
			B = `0x${hex[3]}${hex[3]}`;
		} else if (hex.length == 7) {
			R = `0x${hex[1]}${hex[2]}`;
			G = `0x${hex[3]}${hex[4]}`;
			B = `0x${hex[5]}${hex[6]}`;
		}
		rgb = {"r":+R,"g":+G,"b":+B};
		Object.setPrototypeOf(rgb, null);
	}
	return rgb;
}
const RGBtoHSL = rgb => {
	let hsl = Object.create(null);
	if (rgb.r !== rgb.u && rgb.g !== rgb.u && rgb.b !== rgb.u) {
		let [R,G,B] = [ rgb.r / 255, rgb.g / 255, rgb.b / 255 ]
		const M = Math.max(R, G, B);
		const m = Math.min(R, G, B);
		const U = Math.acos((R - G/2 - B/2) / Math.sqrt( R*R + G*G + B*B - R*G - R*B - G*B )) / Math.PI / 2;
		const L = (M + m) / 2;
		const S = (M - m) / (1 - Math.abs(2*L - 1));
		const H = (B > G) ? 1 - U : U;
		const round = (num) => Math.round((num + Number.EPSILON) * 10**8) / 10**8;
		hsl = {"h":round(H * 360),"s":round(S * 100),"l":round(L * 100)};
		Object.setPrototypeOf(hsl, null);
	}
	return hsl;
};
const HSLtoRGB = hsl => {
	let [H,S,L] = [ hsl.h / 360, hsl.s / 100, hsl.l / 100 ]
	const A = S * Math.min(L, 1 - L);
	const f = N => {
		const K = (N + H * 12) % 12;
		const color = L - A * Math.max(Math.min(K - 3, 9 - K, 1), -1);
		return Math.round(255 * (color + Number.EPSILON) * 10**8) / 10**8;
	};
	return {"r":f(0),"g":f(8),"b":f(4)}
}

window.history.replaceState(null,null,location.href);

window.addEventListener("DOMContentLoaded", event => {
	prefs.getColors(event);
	messages.getMessages()
});

