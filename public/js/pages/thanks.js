window.addEventListener("DOMContentLoaded", event => {
	const search = location.href.substring(1).split("?")[1];
	if (search) {
		let displayresultHTML = `<ul class="displayresult">\n`;
		const label = {"fullname":"Full name", "firstname":"First name", "lastname":"Last name", "email":"Email", "tel":"Phone", "message":"Message"};
		const formpost = querystring.parse(search);
		for (const name in formpost) {
			displayresultHTML += `<li>${label[name] || name.charAt(0).toUpperCase() + name.slice(1)}: ${formpost[name]}</li>\n`;
		}
		displayresultHTML += `</ul>`;

		let content = "";
		content += `<p class="received">We received your message.</p><p>You have entered:</p>\n${displayresultHTML}\n`;
		content += `<div><p>The information has been saved in our database.</p></div>\n`;
		content += `<div><p><a class="goback" href="${document.referrer}" onclick="history.back()">[ Back to Previous Page ]</a></p></div>`;

		let pageTitle = document.getElementById("page-title").innerText;
		document.getElementById("form-results").parentElement.innerHTML = `<h1>${pageTitle}</h1>\n${content}\n`;
	}
});

