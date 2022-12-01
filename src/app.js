const http = require("http");
const fs = require("fs");
const mime = require("mime-types");
const mysql = require("mysql");
const querystring = require("node:querystring");

const port = 9000;
const hostname = "localhost";

const callback = err => { if (err) throw(err); }

const sql = mysql.createConnection({
	user: "nodepages",
	host: "localhost",
	password: "password"
}, callback);

sql.connect(callback);
sql.query("USE barangay", callback);

const templatepath = "./public";
let templateData = fs.readFileSync(`${templatepath}/template.html`).toString();
sql.query("SELECT brgy_name, brgy_city, brgylogofilename, citylogofilename FROM brgy_info", (err, result, packet) => {
	let brgy_info = result[0];
	templateData = templateData
		.replaceAll("%sql:brgy_info:citylogofilename%",brgy_info.citylogofilename)
		.replaceAll("%sql:brgy_info:brgylogofilename%",brgy_info.brgylogofilename)
		.replaceAll("%sql:brgy_info:brgy_city%",brgy_info.brgy_city)
		.replaceAll("%sql:brgy_info:brgy_name%",brgy_info.brgy_name)
	;
});

const server = http.createServer((req, res) => {

	let search = "";
	let pathArr = req.url.substring(1).split("?");
	let filename = `${pathArr[0] || "home"}`;
	if (filename.indexOf(".") == -1) {
		templateHTML = fs.existsSync(`public/css/pages/${filename}.css`) ? templateData.replace("%req:current-page%", filename) : templateData.replace(/^.*%req:current-page%.*$\n/mg, "");
		let content = "";
		switch (filename) {
		case "home":
			let q = pathArr[1];
			req.on("data", chunk => {search += chunk});
			req.on("end", () => {
				if (search) {
					let formpost = querystring.parse(search);
					formpost["bulletin_date_created"] = new Date().toISOString().slice(0, 19).replace('T', ' ');
					formpost["bulletin_classification_icon"] = ["project-update","news-update","waterservice","calamity"][formpost["bulletin_classification_id"] - 1];
					formpost["bulletin_details"] = `<p>${formpost["bulletin_details"]}</p>`.replaceAll(/\n/g,"</p><p>");
					sql.query(`INSERT INTO brgy_bulletin (
						bulletin_classification_id,
						bulletin_classification_icon,
						bulletin_classification_title,
						bulletin_classification_subtitle,
						bulletin_details,
						bulletin_image_filename,
						bulletin_date_created
					) VALUES (
						'${formpost["bulletin_classification_id"]}',
						'${formpost["bulletin_classification_icon"]}',
						'${formpost["bulletin_classification_title"]}',
						'${formpost["bulletin_classification_subtitle"]}',
						'${formpost["bulletin_details"]}',
						'${formpost["bulletin_image_filename"]}',
						'${formpost["bulletin_date_created"]}'
					)`, callback);
				}
				sql.query("SELECT bulletin_id, bulletin_classification_id, bulletin_classification_icon, bulletin_classification_title, bulletin_classification_subtitle, bulletin_details, bulletin_image_filename, bulletin_date_created FROM brgy_bulletin", (err, result, packet) => {
					res.writeHead(200, {"Content-Type": "text/html"});
					if (q == "post") {
						content += `				<!-- add new bulletin post -->
				<h1>New Bulletin Post</h1>
				<div class="new-bulletin-form">
				<form class="post" method="post">
				<input type="hidden" id="bulletin_id" name="bulletin_id" value="${1000 + result.length}">
				<label for="bulletin_classification_id">Type:</label>
				<select id="bulletin_classification_id" name="bulletin_classification_id">
					<option value="1">Project Update</option>
					<option value="2">News Update</option>
					<option value="3">Water Service</option>
					<option value="4">Calamity</option>
				</select>
				<label for="bulletin_classification_title">Title:</label>
				<input type="text" id="bulletin_classification_title" name="bulletin_classification_title" required>
				<label for="bulletin_classification_subtitle">Subtitle:</label>
				<input type="text" id="bulletin_classification_subtitle" name="bulletin_classification_subtitle" required>
				<label for="bulletin_details">Details:</label>
				<textarea rows="5" id="bulletin_details" name="bulletin_details" required></textarea>
				<label for="bulletin_image_filename">Image:</label>
				<input type="file" id="bulletin_image_filename" name="bulletin_image_filename">
				<label></label>
				<div><button type="submit">Send</button> <button type="reset">Clear</button></div>
				</form>
				</div>
				<script>history.replaceState(null,null,location.href)</script>\n`;
					}
						content += `				<!-- bulletin posts -->`;
					for (row of result.reverse()) {
						row.bulletin_date_created = new Date(row.bulletin_date_created - 60000 * row.bulletin_date_created.getTimezoneOffset());
						row.bulletin_image = row.bulletin_image_filename ? `<img src="/content/bulletin/images/upload/${row.bulletin_image_filename}">` : "";
						content += `
				<!-- bulletin post ${row.bulletin_id} -->
				<div class="bulletin-post">
					<div class="bulletin-post-header">
						<div class="bulletin-post-header-icon ${row.bulletin_classification_icon}"></div>
						<div class="bulletin-post-header-text">
							<div class="bulletin-post-title">${row.bulletin_classification_title}</div>
							<div class="bulletin-post-subtitle">${row.bulletin_classification_subtitle}</div>
							<div class="bulletin-post-date">Posted: ${row.bulletin_date_created.toLocaleString()}</div>
						</div>
						<div class="bulletin-post-header-image"></div>
					</div>
					<div class="bulletin-post-details">
						<div class="bulletin-post-details-text">${row.bulletin_details}</div>
						<div class="bulletin-post-details-image">${row.bulletin_image}</div>
					</div>
					<div class="bulletin-post-footer">
						<div class="bulletin-post-footer-text">
							<p>Post ID No.: ${row.bulletin_id}</p>
						</div>
						<div class="bulletin-post-footer-reactions"></div>
					</div>
				</div>`;
					}
						content += `\n				<!-- end bulletin posts -->`;
					if (q != "post") {
						content += `\n				<div class="newpost-anchor"><a href="/?post">[ New post ]</a></div>`;
					}
					res.write(templateHTML.replace("<!-- content -->", content));
					res.end();
				});
			});
			break;
		case "logbook":
			sql.query("CREATE TABLE IF NOT EXISTS logbook( \
				id INT UNIQUE NOT NULL AUTO_INCREMENT, \
				logbook_displayname VARCHAR(1024) NOT NULL, \
				logbook_message TEXT NOT NULL, \
				logbook_datetime DATETIME NOT NULL, \
				PRIMARY KEY(id))",
			callback);
			req.on("data", chunk => {search += chunk});
			req.on("end", () => {
				if (search) {
					let formpost = querystring.parse(search);
					formpost["logbook_datetime"] = new Date().toISOString().slice(0, 19).replace('T', ' ');
					sql.query(`INSERT INTO logbook (logbook_displayname, logbook_message, logbook_datetime) VALUES ('${formpost["logbook_displayname"]}','${formpost["logbook_message"]}', '${formpost["logbook_datetime"]}')`, callback);
				}
				sql.query("SELECT logbook_displayname, logbook_message, logbook_datetime FROM logbook", (err, result, packet) => {
					if (err) { console.log(err.message) }
					else {
						content = `
					<h1>Leave a Message</h1>
					<p>Hello mga kabarangay. This is our online logbook. Feel free to leave a note to us.</p>
					<div class="logbook">
						<form class="post" method="post">
						<label for="logbook_displayname">Name:</label>
						<input type="text" id="logbook_displayname" name="logbook_displayname" required>
						<label for="logbook_message">Message:</label>
						<textarea rows="5" id="logbook_message" name="logbook_message" required></textarea>
						<label></label>
						<div><button type="submit">Send</button> <button type="reset">Clear</button></div>
						</form>
						<div class="logbook-posts">`
						for (row of result.reverse()) {
							row.logbook_datetime = new Date(row.logbook_datetime - 60000 * row.logbook_datetime.getTimezoneOffset());
							content += `
							<div class="logbook-post">
								<div class="logbook-post-header"><div class="logbook-post-displayname">${row.logbook_displayname}</div><div class="logbook-post-date">${row.logbook_datetime.toLocaleString()}</div></div>
								<div class="logbook-post-message"><p>${row.logbook_message.replaceAll(/\n/g,"</p><p>")}</p></div>
							</div>`
						}
						content += `
						<script>history.replaceState(null,null,location.href)</script>
						</div>
					</div>`
						res.writeHead(200, {"Content-Type": "text/html"});
						res.write(templateHTML.replace("<!-- content -->", content));
						res.end();
					}
				});
			});
			break;
		case "post":
			req.on("data", chunk => {search += chunk});
			req.on("end", () => {
				search = search || req.url.split("?")[1] || "";
				let formpost = querystring.parse(search);
				let displayresult = "<ul class=\"displayresult\">\n";
				for (name in formpost) {
					displayresult += `<li>${name}: ${formpost[name]}</li>\n`;
				}
				displayresult += "</ul>";
				res.writeHead(200, {"Content-Type": "text/html"});
				content += `<h1>Thank you</h1>\n<p>You have entered:</p>\n${displayresult}\n`;
				content += `<div>\n<p>The information has been saved in our database.</p>\n<p><a class="goback" href="javascript:history.back()">[ Back to Previous Page ]</a></p>\n</div>`;
				res.write(templateHTML.replace("<!-- content -->", content));
				res.end();
			});
			break;
		default:
			sql.query(`SELECT title, content FROM pages WHERE id = '${filename}'`, (err, result) => {
				if (err) {
					console.log(err.message);
					content = `<h1>500 Server Error</h1><p>The following error occured at the server:</p><p>[${err.message}]</p>`;
					res.writeHead(500, {"Content-Type": "text/html"});
					res.write(templateHTML.replace("<!-- content -->", content));
					res.end();
				} else {
					if (result[0]) {
						content = `<h1>${result[0].title}</h1>\n${result[0].content}`;
						res.writeHead(200, {"Content-Type": "text/html"});
						res.write(templateHTML.replace("<!-- content -->", content));
						res.end();
					} else {
						content = `<h1>404 Not Found</h1><p>The resource '${req.url}' was not found on this server.</p>`;
						res.writeHead(404, {"Content-Type": "text/html"});
						res.write(templateHTML.replace("<!-- content -->", content));
						res.end();
					}
				}
			});
		}
	} else {
		fs.readFile(`${templatepath}/${filename}`, function(err, content) {
			if (err) {
				switch (err.code) {
				case "ENOENT":
					res.writeHead(404, {"Content-Type": "text/html"});
					res.message = `<p>The resource '${req.url}' was not found on this server.</p>`;
					break;
				case "EACCES":
					res.writeHead(403, {"Content-Type": "text/html"});
					res.message = `<p>The resource '${req.url}' exists but cannot be accessed.</p>`;
					break;
				default:
					res.writeHead(500, {"Content-Type": "text/html"});
					res.message = `<p>The following error occured at the server:</p><p>[${err.message}]</p>`;
				}
				content = `<h1>${res.statusCode.toString()} ${res.statusMessage.toString()}</h1>${res.message}`;
				res.write(templateHTML.replace("<!-- content -->", content));
				res.end();
			} else {
				let mimetype = mime.lookup(filename);
				res.writeHead(200, {"Content-Type": mimetype});
				if (mimetype == "text/css") {
					sql.query("SELECT hue_primary FROM brgy_hue", (err, result, packet) => {
						hue_primary = result[0].hue_primary.toString();
						content = content.toString().replaceAll("%sql:brgy_hue:hue_primary%",hue_primary);
						res.write(content);
						res.end();
					});
				}
				else {
					res.write(content);
					res.end();
				}
			}
		});
	}

});

server.listen(port, hostname, () => {
	console.log("\x1b[36m%s\x1b[0m",`[app] Development server running at ${hostname} over ${port}...`, "\x1b[0m");
	console.log("\x1b[34m%s\x1b[0m",`[app] http://${hostname}:${port}\x1b[0m`, "\x1b[0m");
});

