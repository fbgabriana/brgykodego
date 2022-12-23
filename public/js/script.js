// Barangay KodeGo

const auth = {
	token: cookieStorage.getItem("u"),
	require(requiredLevel) {
		if (this.token) {
			if (this.token[0] < requiredLevel) {
				location.href = "/auth";
			}
		} else {
			location.href = `/login?${location.href.replace(location.origin,"")}`;
		}
	},
	logout(redir) {
		cookieStorage.removeItem("u");
		location.href = redir || "/";
	}
}

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

const validator = {
	email : /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
	password : /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
	tel : /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/,
	length(N) {
		return new RegExp(`(.+){${N}}`);
	},
}

const toggleMenuBar = () => {
	let menubar = document.getElementById("menubar");
	menubar.style.display = menubar.style.display == "none" ? "block" : "none";
}

const windowResize = () => {
	let menubar = document.getElementById("menubar");
	let menubtn = document.getElementById("menubtn");
	let heading = document.querySelector("h1");
	if (window.innerWidth <= 500) {
		heading.style.fontSize = window.innerWidth / 260 + "rem";
		menubar.style.display = "none";
		menubtn.style.display = "block";
		menubtn.style.width = heading.style.fontSize;
		menubtn.style.height = heading.style.fontSize;
		menubtn.style.top = (heading.offsetHeight - menubtn.offsetHeight) / 2 * 1.1 + "px";
	}
	else {
		heading.style.fontSize = "2.5rem";
		menubar.style.display = "block";
		menubtn.style.display = "none";
	}
	let aside = document.querySelector("body>aside");
	let main = document.querySelector("body>main");
	let sidebar = document.querySelector("body .sidebar");
	if (window.innerWidth < 862) {
		main.appendChild(sidebar);
	} else {
		aside.appendChild(sidebar);
	}
}

const setDocumentTitle = () => {
	let websiteTitleElement = document.querySelector("title");
	let articleTitleElement = document.querySelector("article h1");
	if (websiteTitleElement && articleTitleElement) {
		document.title = websiteTitleElement.innerHTML + ": " + articleTitleElement.innerHTML;
	}
}

const setCurrentPage = () => {
	let a = document.querySelectorAll("a");
	let currentLocation = location.href.replace("index.html","");
	for (i = 0; i < a.length; i++) {
		if (a[i].origin == location.origin) {
			if (auth.token) {
				const login = document.getElementById(`nav-login`);
				login.innerText = "Logout";
				login.href = "/logout";
				login.addEventListener("click", event => {
					event.preventDefault();
					auth.logout("/login");
				});
			}
			if (a[i].href == currentLocation) {
				a[i].classList.add("current-page");
				a[i].removeAttribute("href");
				a[i].removeAttribute("title");
			}
			if (a[i].href == `${location.origin}/`) {
				a[i].title = "Back to Home";
			} else if (currentLocation.includes(a[i].href)) {
				a[i].classList.add("current-section");
			}
		}
	}
}

const addColorSwitcher = (selector) => {
	if (! window.matchMedia ) return;
	if (! (CSS && CSS.supports("color-scheme", "light")) ) return;

	const selectorElement = document.querySelector(selector);
	if (selectorElement) {
		const media_colorswitcher = window.matchMedia("(prefers-color-scheme: light)");
		const link_colorswitcher = document.querySelector("link[href$='colors.css']");
		const checkbox_colorswitcher = document.createElement("input");
		const label_colorswitcher = document.createElement("label");
		const meta_colorswitcher = document.createElement("meta");
		const link_href = link_colorswitcher.getAttribute("href");

		checkbox_colorswitcher.type = "checkbox";
		checkbox_colorswitcher.id = "colorswitcher_checkbox";
		checkbox_colorswitcher.className = "colorswitcher";
		label_colorswitcher.id = "colorswitcher_label";
		label_colorswitcher.className = "colorswitcher";
		label_colorswitcher.innerText = "Toggle Dark Mode";
		label_colorswitcher.htmlFor = checkbox_colorswitcher.id;
		meta_colorswitcher.setAttribute("name", "color-scheme");

		selectorElement.appendChild(checkbox_colorswitcher);
		selectorElement.appendChild(label_colorswitcher);
		document.head.appendChild(meta_colorswitcher);

		const menubtn = document.querySelector(`#menubtn`);
		const favicon = document.querySelector(`link[rel="icon"]`);

		const set_colorscheme = () => {
			let colorscheme = media_colorswitcher.matches ^ checkbox_colorswitcher.checked ? "light" : "dark";
			link_colorswitcher.href = link_href.replace(".css", `-${colorscheme}.css`);
			checkbox_colorswitcher.dataset.colorscheme = colorscheme;
			label_colorswitcher.dataset.colorscheme = colorscheme;
			document.documentElement.style.colorScheme = colorscheme;
			document.documentElement.dataset.colorscheme = colorscheme;
			meta_colorswitcher.content = colorscheme;
			menubtn.src  = `svg/${colorscheme}/menu.svg`;
			favicon.href = `svg/${colorscheme}/favicon.svg`;
			localStorage.setItem("checkbox_colorswitcher", checkbox_colorswitcher.checked);
		}
		checkbox_colorswitcher.checked = (localStorage.getItem("checkbox_colorswitcher") == "true");
		set_colorscheme();

		media_colorswitcher.addEventListener("change", event => {
			set_colorscheme();
		});

		checkbox_colorswitcher.addEventListener("change", event => {
			set_colorscheme();
			if (navigator.vibrate) navigator.vibrate(5);
		});
	}
}

document.insertHTML = function(markup) {
	const scripts = document.getElementsByTagName("script");
	scripts[scripts.length - 1].insertAdjacentHTML("afterend", markup);
}

document.addEventListener("DOMContentLoaded", event => {
	document.querySelectorAll('img').forEach(function(img){
		img.onerror = function() {this.style.display='none';};
	})
});

window.addEventListener("load", event => {
	windowResize();
});

window.addEventListener("resize", event => {
	windowResize();
});

window.addEventListener("DOMContentLoaded", event => {
	setDocumentTitle();
	setCurrentPage();
	addColorSwitcher("footer p.copyright");
});

