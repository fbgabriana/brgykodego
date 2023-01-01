auth.require(1);

const UpdateProfile = async () => {
	const currentuser = await fetch("/query?currentuser").then(res => res.json());
	const form = document.getElementById("update-profile");
	const updateuser = document.getElementById("update-user");
	const resetusers = document.getElementById("reset-users");
	const usernameid = document.getElementById("username");
	const status = document.getElementById("status");
	form.refresh = event => {
		form.elements["username"].disabled = true;
		form.elements["username"].value = currentuser.username;
		form.elements["password"].value = "";
		form.elements["confirm-password"].value = "";
		form.elements["displayname"].value = currentuser.userinfo.displayname;
		form.elements["email"].value = currentuser.userinfo.email;
		status.innerText = sessionStorage.getItem("status");
		sessionStorage.removeItem("status");
	}
	form.validate = event => {
		if (form.elements["password"].value
		&&  form.elements["password"].value !== form.elements["confirm-password"].value) {
			alert("Passwords do not match");
			form.elements["password"].value = "";
			form.elements["confirm-password"].value = "";
			return false;
		}
		if (form.elements["password"].value
		&& !form.elements["password"].value.match(validator.length(8))) {
			alert("Password must have at least 8 characters.");
			return false;
		}
		if (form.elements["email"].value
		&& !form.elements["email"].value.match(validator.email)) {
			alert("Invalid email");
			return false;
		}
		return true;
	}
	form.submit = event => {
		event.preventDefault();
		let update = {};
		switch (event.target.id) {
		case "update-user":
			if (! form.validate() ) return;
			update = {
				"username":form.elements["username"].value,
				"authlevel":form.elements["authlevel"].value,
				"password":form.elements["password"].value,
				"userinfo":{
					"displayname":form.elements["displayname"].value || form.elements["username"].value,
					"email":form.elements["email"].value,
				}
			};
			break;
		default:
			form.refresh();
			return;
		}
		fetch("/query?users", {
			method:"POST",
			headers:{"Content-Type": "application/json"},
			body: JSON.stringify(update),
		}).then(res => res.json()).then(user => {
			if (update.password) sessionStorage.setItem("status", "Profile updated. Password has changed.")
			else sessionStorage.setItem("status", "Profile updated.")
			location.reload();
		});
	}
	form.refresh();
	resetusers.addEventListener("click", form.refresh);
	updateuser.addEventListener("click", form.submit);
}

window.addEventListener("DOMContentLoaded", UpdateProfile);

