auth.require(3);

const ManageUsers = async () => {
	const users = await fetch("/query?users").then(res => res.json());
	const form = document.getElementById("manage-users");
	const userselect = document.getElementById("userselect");
	const updateuser = document.getElementById("update-user");
	const deleteuser = document.getElementById("delete-user");
	const usernameid = document.getElementById("username");
	userselect.appendChild(new Option("Create new user", ""));
	for (user of users) {
		if (user.username === "root") continue;
		userselect.appendChild(new Option(user.userinfo.displayname, user.username));
	}
	userselect.value = location.hash.slice(1);
	form.refresh = event => {
		if (userselect.selectedIndex > 1) {
			for (user of users) {
				if (userselect.value == user.username) {
					form.elements["username"].disabled = true;
					form.elements["username"].value = user.username;
					form.elements["password"].value = "";
					form.elements["confirm-password"].value = "";
					form.elements["authlevel"].value = user.authlevel;
					form.elements["displayname"].value = user.userinfo.displayname;
					form.elements["email"].value = user.userinfo.email;
				}
			}
			updateuser.innerText = "Update User"
			deleteuser.style.display = "block";
			location.hash = userselect.value;
		} else {
			form.elements["username"].disabled = false;
			form.elements["username"].select();
			updateuser.innerText = "Create User";
			deleteuser.style.display = "none";
			form.reset();
			userselect.selectedIndex = 1;
			location.hash = "";
		}
	}
	form.changed = event => {
		location.hash = usernameid.value;
	}
	form.validate = event => {
		if (form.elements["username"].value === "") {
			alert("Username cannot be empty");
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
		if (form.elements["authlevel"].value < 0
		||  form.elements["authlevel"].value > 2) {
			alert("Invalid authlevel");
			return false;
		}
		if (userselect.value === "" && form.elements["password"].value === "") {
			alert("Password cannot be empty");
			return false;
		}
		return true;
	}
	form.submit = event => {
		event.preventDefault();
		let update = {};
		switch (event.target.id) {
		case "update-user":
			form.elements["username"].disabled = false;
			if (! form.validate() ) return;
			update = {
				"username":form.elements["username"].value,
				"authlevel":form.elements["authlevel"].value,
				"password":form.elements["password"].value,
				"userinfo":{
					"displayname":form.elements["displayname"].value,
					"email":form.elements["email"].value,
				}
			};
			if (update.username) form.elements["username"].disabled = true;
			break;
		case "delete-user":
			let confirmDelete = confirm(`Warning! This cannot be undone. Do you really wish to delete\n\nthe user account of '${userselect.options[userselect.selectedIndex].text}'? OK or Cancel.`);
			if (confirmDelete === false) return;
			update = {
				"username":form.elements["username"].value,
			};
			break;
		default:
			return;
		}
		fetch("/query?users", {
			method:"POST",
			headers:{"Content-Type": "application/json"},
			body: JSON.stringify(update),
		}).then(res => res.json()).then(users => {
			location.reload();
		});
	}
	form.refresh();
	userselect.addEventListener("change", form.refresh);
	usernameid.addEventListener("change", form.changed);
	updateuser.addEventListener("click", form.submit);
	deleteuser.addEventListener("click", form.submit);
}

window.addEventListener("DOMContentLoaded", ManageUsers);
