auth.require(1);

const UpdateProfile = async () => {
	const currentuser = await fetch("/query?currentuser").then(res => res.json());
	const form = document.getElementById("update-profile");
	const pagetitle = document.getElementById("page-title");
	const updateuser = document.getElementById("update-user");
	const deleteuser = document.getElementById("delete-user");
	const resetusers = document.getElementById("reset-users");
	const usernameid = document.getElementById("username");
	const showdelete = document.getElementById("show-delete");
	const showdeletelabel = document.querySelector("label[for='show-delete']");
	const status = document.getElementById("status");
	form.refresh = event => {
		form.elements["username"].disabled = true;
		form.elements["username"].value = currentuser.username;
		form.elements["password"].value = "";
		form.elements["confirm-password"].value = "";
		form.elements["authlevel"].value = currentuser.authlevel;
		form.elements["displayname"].value = currentuser.userinfo.displayname;
		form.elements["email"].value = currentuser.userinfo.email;
		showdelete.checked = false;
		deleteuser.style.display = "none";
		pagetitle.innerText = currentuser.userinfo.displayname;
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
		case "delete-user":
			let confirmDelete = confirm(`Warning! This cannot be undone. Do you really wish to DELETE your OWN user account?\n\nThis will also log you out and you will not be able to login again. OK or Cancel.`);
			if (confirmDelete === false) return;
			if (currentuser.authlevel === 3) {
				alert("DELETE FAILED\n\nError: A root account cannot be deleted.");
				form.refresh();
				return;
			}
			update = {
				"username":form.elements["username"].value,
			};
			auth.logout();
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
	form.showdelete = event => {
		deleteuser.style.display = showdelete.checked ? "block" : "none";
	}
	form.refresh();
	showdelete.addEventListener("click", form.showdelete);
	resetusers.addEventListener("click", form.refresh);
	updateuser.addEventListener("click", form.submit);
	deleteuser.addEventListener("click", form.submit);
}

const LoadProfile = () => {
	const showdelete = document.getElementById("show-delete");
	const showdeletelabel = document.querySelector("label[for='show-delete']");
	showdelete.checked = false;
	if (auth.token[0] <= 2) {
		showdelete.style.display = "inline-block";
		showdeletelabel.style.display = "inline-block";
	} else {
		showdelete.style.display = "none";
		showdeletelabel.style.display = "none";
	}
}

window.addEventListener("DOMContentLoaded", UpdateProfile);
window.addEventListener("DOMContentLoaded", LoadProfile);

