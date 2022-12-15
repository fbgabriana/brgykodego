auth.require(3);

window.addEventListener("DOMContentLoaded", async event => {
	const users = await fetch("/get?users").then(res => res.json());
	const form = document.getElementById("manage-users");
	const userselect = document.getElementById("userselect");
	const updateuser = document.getElementById("update-user");
	const deleteuser = document.getElementById("delete-user");
	form.reset();
	userselect.appendChild(new Option("Create new user", ""));
	for (user of users) {
		if (user.username === "root") continue;
		userselect.appendChild(new Option(user.displayname, user.username));
	}
	userselect.addEventListener("change", event => {
		if (userselect.selectedIndex > 1) {
			for (user of users) {
				if (userselect.value == user.username) {
					form.elements["username"].disabled = true;
					form.elements["username"].value = user.username;
					form.elements["authlevel"].value = user.authlevel;
					form.elements["displayname"].value = user.displayname;
					form.elements["email"].value = user.email;
				}
			}
			updateuser.innerText = "Update User"
			deleteuser.style.display = "block";
		} else {
			form.elements["username"].disabled = false;
			form.elements["username"].select();
			updateuser.innerText = "Create User";
			deleteuser.style.display = "none";
			form.reset();
			userselect.selectedIndex = 1;
		}
	});
	updateuser.addEventListener("click", event => {
		form.elements["username"].disabled = false;
		const formdata = new FormData(form);
		const user = {
			"username":formdata.get("username"),
			"authlevel":formdata.get("authlevel"),
			"password":formdata.get("password"),
			"userinfo":{
				"displayname":formdata.get("displayname"),
				"email":formdata.get("email"),
			}
		};
		if (user.username) form.elements["username"].disabled = true;
		fetch("/admin?users", {
			method:"POST",
			headers:{"Content-Type": "application/json"},
			body: JSON.stringify(user),
		});
	});
});

