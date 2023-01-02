window.addEventListener("DOMContentLoaded", event => {
	const signupNotice = document.getElementById("signup-notice");
	const signupComplete = document.getElementById("signup-complete");
	const username = document.getElementById("username");
	const password = document.getElementById("password");
	const form = document.getElementById("login-form");
	let signupUsername = sessionStorage.getItem("username");
	if (signupUsername) {
		signupNotice.style.display = "none";
		signupComplete.style.display = "block";
		username.value = signupUsername;
		username.disabled = true;
		password.focus();
		sessionStorage.removeItem("username")
	} else {
		signupNotice.style.display = "block";
		signupComplete.style.display = "none";
	}
	form.submit = event => {
		username.disabled = false;
	}
	form.addEventListener("submit", form.submit);
});

