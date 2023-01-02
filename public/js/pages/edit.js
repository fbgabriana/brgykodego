auth.require(2);

const EditPage = async () => {
	const pages = await fetch("/query?pages").then(res => res.json());
	const pageid = querystring.parse(location.search).id;
	const form = document.getElementById("edit-page");
	const pagetitle = document.getElementById("page-title");
	const textarea = document.querySelector("#edit-page textarea");
	const savechanges = document.getElementById("savechanges");
	const saveandexit = document.getElementById("saveandexit");
	const status = document.getElementById("status");
	status.innerText = "No changes yet.";
	savechanges.disabled = true;
	saveandexit.disabled = true;

	let pagelist = [];
	for (page of pages) {
		pagelist.push(page.id);
		if (page.id == pageid) {
			textarea.value = page.content;
			pagetitle.innerText = page.title;
			break;
		}
	}
	form.submit = event => {
		event.preventDefault();
		if (textarea.value == page.content) {
			console.log("Nothing to Save.");
			if (event.target.id == "saveandexit") {
				location.href = `/${pageid}`;
				return;
			}
			return form.status();
		}
		console.log("Saving...")
		for (page of pages) {
			if (page.id == pageid) {
				page.content = textarea.value;
				break;
			}
		}
		fetch("/query?pages", {
			method:"POST",
			headers:{"Content-Type": "application/json"},
			body: JSON.stringify(page),
		}).then(res => res.json()).then(page => {
			if (event.target.id == "saveandexit") {
				location.href = `/${pageid}`;
			} else {
				savechanges.disabled = true;
				status.innerText = "Changes have been saved.";			
				status.style.color = "green";
			}
		});
	}
	form.status = event => {
		if (textarea.value == page.content) {
			savechanges.disabled = true;
			status.innerText = "No unsaved changes.";
			status.style.color = "";
			return false;
		} else {
			savechanges.disabled = false;
			saveandexit.disabled = false;
			status.innerText = "Page has unsaved changes.";
			status.style.color = "red";
			return true;
		}
	}
	form.input = event => {
		setInterval(form.status, 1000);
	}
	form.keydown = event => {
		if (event.ctrlKey && event.key === 's') {
			event.preventDefault();
			console.log("Ctrl+S")
			form.submit(event);
		}
	}
	textarea.addEventListener("input", form.status);
	textarea.addEventListener("keydown", form.keydown);
	savechanges.addEventListener("click", form.submit);
	saveandexit.addEventListener("click", form.submit);
}

window.addEventListener("DOMContentLoaded", EditPage);

