const handleColorCode = event => {
	event.preventDefault();
	const colorcode = document.querySelector("#colorcode");
	const colorchanger = document.querySelector("#colorchanger");
	const rgb = HEXtoRGB(colorcode.value);
	const hsl = RGBtoHSL(rgb);
	console.log(rgb, hsl);

	if (typeof hsl.h === "undefined") {
		alert("Invalid input");
	} else if (isNaN(hsl.h)) {
		alert("Hue is undefined");
	} else {
		document.body.style.cursor = colorchanger.style.cursor = "progress";
		localStorage.setItem("colorcode",colorcode.value)
		const xhr = new XMLHttpRequest();
		xhr.open("POST", "/update-prefs?colortheme", true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.send(`hue_id=0&hsl_hue=${hsl.h}&hsl_saturation=${hsl.s}&hsl_lightness=${hsl.l}`);
		setTimeout(() => {
			location.reload(true);
		}, 360);
	}
}
const HEXtoRGB = (hex) => {
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
		const round = (num) => Math.round((num + Number.EPSILON) * 1000000) / 1000000;
		hsl = {"h":round(H * 360),"s":round(S * 100),"l":round(L * 100)};
		Object.setPrototypeOf(hsl, null);
	}
	return hsl;
};
window.addEventListener("DOMContentLoaded", event => {
	const colorcode = document.getElementById("colorcode");
	const colorpicker = document.getElementById("colorpicker");
	colorcode.value = colorpicker.value = localStorage.getItem("colorcode") || "#000000";
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
});
window.history.replaceState(null,null,location.href);
