const CreateNewUser = async () => {
	const users = await fetch("/query?users").then(res => res.json());
	const form = document.getElementById("signup");
	const createuser = document.getElementById("create-user");
	const usernameid = document.getElementById("username");
	form.refresh = event => {
		form.reset();
		form.elements["username"].select();
	}
	form.validate = event => {
		for (user of users) {
			if (form.elements["username"].value === user.username) {
				alert(`Username "${user.username}" already exists on our system`);
				return false;
			}
		}
		if (form.elements["username"].value === "") {
			alert("Username cannot be empty");
			return false;
		}
		if (form.elements["password"].value === "") {
			alert("Password cannot be empty");
			return false;
		}
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
		case "create-user":
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
			sessionStorage.setItem("username",`${user.username}`)
			location.href = `/login`;
		});
	}
	form.refresh();
	createuser.addEventListener("click", form.submit);
}

window.addEventListener("DOMContentLoaded", CreateNewUser);

