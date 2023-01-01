window.addEventListener("DOMContentLoaded", event => {
	const signupNotice = document.getElementById("signup-notice");
	const signupComplete = document.getElementById("signup-complete");
	const username = document.getElementById("username");
	const password = document.getElementById("password");
	let signupUsername = sessionStorage.getItem("username");
	if (signupUsername) {
		signupNotice.style.display = "none";
		signupComplete.style.display = "block";
		username.value = signupUsername;
		password.focus();
		sessionStorage.removeItem("username")
	} else {
		signupNotice.style.display = "block";
		signupComplete.style.display = "none";
	}
});

