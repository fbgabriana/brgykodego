auth.require(2);

const EditPage = async () => {
	const pageid = querystring.parse(location.search).id;
	const form = document.getElementById("edit-page");
	const pagetitle = document.getElementById("page-title");
	const textarea = document.querySelector("#edit-page textarea");
	const status = document.getElementById("status");
	const savechanges = document.getElementById("savechanges");
	const saveandexit = document.getElementById("saveandexit");
	const pages = await fetch("/query?pages").then(res => res.json());
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
				status.innerText = "Changes have been saved.";			
				status.style.color = "green";
			}
		});
	}
	form.status = event => {
		if (textarea.value == page.content) {
			status.innerText = "No unsaved changes.";
			status.style.color = "";
		} else {
			status.innerText = "Page has unsaved changes.";
			status.style.color = "red";
		}
	}
	form.input = event => {
		setInterval(form.status, 1000);
	}
	textarea.addEventListener("input", form.status);
	savechanges.addEventListener("click", form.submit);
	saveandexit.addEventListener("click", form.submit);
}

window.addEventListener("DOMContentLoaded", EditPage);

