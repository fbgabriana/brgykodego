const mysql = require("mysql");
const http = require("http");
const fs = require("fs");
const util = require("util");
const mime = require("mime-types");
const querystring = require("querystring");

const port = 9000;
const hostname = "brgykodego.gov.ph.test";
const publicpath = "./public";

const sql = mysql.createConnection({
	user: "nodepages",
	host: "localhost",
	password: "password",
	database: "barangay"
});

sql.query = util.promisify(sql.query).bind(sql);
fs.readFile = util.promisify(fs.readFile).bind(fs);

fs.readFile(`${publicpath}/template.html`, "utf8").then(content => {
	return sql.query("SELECT brgy_name, brgy_city, brgylogofilename, citylogofilename FROM brgy_info").then(row => {
		let brgy_info = row[0];
		return content
			.replaceAll("%sql:brgy_info:citylogofilename%",brgy_info.citylogofilename)
			.replaceAll("%sql:brgy_info:brgylogofilename%",brgy_info.brgylogofilename)
			.replaceAll("%sql:brgy_info:brgy_city%",brgy_info.brgy_city)
			.replaceAll("%sql:brgy_info:brgy_name%",brgy_info.brgy_name)
		;
	});
}).then(content => {

	const server = http.createServer((req, res) => {
		const pathArr = req.url.substring(1).split("?");

		let [ filename, q, search ] = [ pathArr[0] || "home", pathArr[1], "" ];
		let templateHTML = content;
		if (filename.indexOf(".") == -1) {
			templateHTML = fs.existsSync(`public/css/pages/${filename}.css`) ? templateHTML.replace("%req:current-page%", filename) : templateHTML.replace(/^.*%req:current-page%.*$\n/mg, "");
			const now = new Date().toISOString().slice(0, 19).replace("T", " ");
			let content = "";
			switch (filename) {
			case "home":
				req.on("data", chunk => {search += chunk});
				req.on("end", () => {
					if (search) {
						const formpost = querystring.parse(search);
						formpost["bulletin_date_created"] = now;
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
						)`);
					}
					sql.query("SELECT bulletin_id, bulletin_classification_id, bulletin_classification_icon, bulletin_classification_title, bulletin_classification_subtitle, bulletin_details, bulletin_image_filename, bulletin_date_created FROM brgy_bulletin").then(result => {
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
						result.reverse().forEach(row => {
							row.bulletin_date_created_localtime = new Date(row.bulletin_date_created - 60000 * row.bulletin_date_created.getTimezoneOffset());
							row.bulletin_image = row.bulletin_image_filename ? `<img src="/content/bulletin/images/upload/${row.bulletin_image_filename}">` : "";
							content += `
				<!-- bulletin post ${row.bulletin_id} -->
				<div class="bulletin-post">
					<div class="bulletin-post-header">
						<div class="bulletin-post-header-icon ${row.bulletin_classification_icon}"></div>
						<div class="bulletin-post-header-text">
							<div class="bulletin-post-title">${row.bulletin_classification_title}</div>
							<div class="bulletin-post-subtitle">${row.bulletin_classification_subtitle}</div>
							<div class="bulletin-post-date">Posted: ${row.bulletin_date_created_localtime.toLocaleString()}</div>
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
						});
							content += `
				<!-- end bulletin posts -->`;
						if (q != "post") {
							content += `
				<div class="newpost-anchor"><a href="/?post">[ New post ]</a></div>`;
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
					logbook_datetime_utc DATETIME NOT NULL, \
					PRIMARY KEY(id))",
				);
				req.on("data", chunk => {search += chunk});
				req.on("end", () => {
					if (search) {
						const formpost = querystring.parse(search);
						formpost["logbook_datetime_utc"] = now;
						sql.query(`INSERT INTO logbook (
							logbook_displayname,
							logbook_message,
							logbook_datetime_utc
						) VALUES (
							'${formpost["logbook_displayname"]}',
							'${formpost["logbook_message"]}',
							'${formpost["logbook_datetime_utc"]}'
						)`);
					}
					sql.query("SELECT logbook_displayname, logbook_message, logbook_datetime_utc FROM logbook").then(result => {
						content = `				<!-- begin logbook -->
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
						result.reverse().forEach(row => {
							row.logbook_datetime_utc = new Date(row.logbook_datetime_utc - 60000 * row.logbook_datetime_utc.getTimezoneOffset());
							content += `
						<div class="logbook-post">
							<div class="logbook-post-header"><div class="logbook-post-displayname">${row.logbook_displayname}</div><div class="logbook-post-date">${row.logbook_datetime_utc.toLocaleString()}</div></div>
							<div class="logbook-post-message"><p>${row.logbook_message.replaceAll(/\n/g,"</p><p>")}</p></div>
						</div>`
						});
						content += `
						<script>history.replaceState(null,null,location.href)</script>
					</div>
				</div>
				<!-- end logbook -->`
						res.writeHead(200, {"Content-Type": "text/html"});
						res.write(templateHTML.replace("<!-- content -->", content));
						res.end();
					});
				});
				break;
			case "post":
				sql.query("CREATE TABLE IF NOT EXISTS formdata( \
					id INT UNIQUE NOT NULL AUTO_INCREMENT, \
					formdata_referer VARCHAR(255) NOT NULL, \
					formdata_query VARCHAR(1024) NOT NULL, \
					formdata_datetime_utc DATETIME NOT NULL, \
					PRIMARY KEY(id))",
				);
				req.on("data", chunk => {search += chunk});
				req.on("end", () => {
					referer = req.headers.referer ? req.headers.referer.replace(`${req.headers.origin}`,"") : "";
					search = search || q;
					if (search) {
						let displayresultText = q = "";
						let displayresultHTML = `<ul class="displayresult">\n`;
						const formpost = querystring.parse(search);
						for (const name in formpost) {
							if (name == "recipient") continue;
							if (name == "redirect") continue;
							q += `${name}=${formpost[name]}&`;
							displayresultText += `${name}: ${formpost[name]},\n`;
							displayresultHTML += `<li>${name}: ${formpost[name]}</li>\n`;
						}
						displayresultHTML += "</ul>";
						displayresultText = displayresultText.trim();
						q = q.replace(/&$/,"");

						formpost["posted"] = now;
						sql.query(`INSERT INTO formdata (
							formdata_referer,
							formdata_query,
							formdata_datetime_utc
						) VALUES (
							'${referer}',
							'${displayresultText}',
							'${formpost["posted"]}'
						)`);

						content += `<h1>Thank you</h1>\n<p class="received">We received your message.</p><p>You have entered:</p>\n${displayresultHTML}\n`;
						content += `<div><p>The information has been saved in our database.</p></div>\n`;

						if (recipient = formpost["recipient"]) {
							// sendmail(recipient, content);
						}
						if (redirect = formpost["redirect"]) {
							res.writeHead(302, {"Location": `${redirect}?${q}`});
							return res.end();
						}
						content += `<div><p><a class="goback" href="${referer}" onclick="history.back()">[ Back to Previous Page ]</a></p></div>`;
					}
					res.writeHead(200, {"Content-Type": "text/html"});
					res.write(templateHTML.replace("<!-- content -->", content));
					return res.end();
				});
				break;
			default:
				sql.query(`SELECT title, content FROM pages WHERE id = '${filename}'`, (err, result, packet) => {
					if (row = result[0]) {
						res.writeHead(200, {"Content-Type": "text/html"});
						content = `<h1>${row.title}</h1>\n${row.content}`;
						res.write(templateHTML.replace("<!-- content -->", content));
						res.end();
					} else if (field = packet[0]) {
						res.writeHead(404, {"Content-Type": "text/html"});
						content = `<h1>${res.statusCode.toString()} ${res.statusMessage.toString()}</h1><p>The resource '${req.url}' was not found in database table '${field.db}.${field.table}'.</p>`;
						res.write(templateHTML.replace("<!-- content -->", content));
						res.end();
					} else if (err) {
						res.writeHead(500, {"Content-Type": "text/html"});
						content = `<h1>${res.statusCode.toString()} ${res.statusMessage.toString()}</h1><p>The following error occured at the server:</p><p>[${err.message}]</p>`;
						res.write(templateHTML.replace("<!-- content -->", content));
						res.end();
						console.log(err.message);
					}
				});
			}
		} else {
			fs.readFile(`${publicpath}/${filename}`).then(content => {
				let mimetype = mime.lookup(filename);
				res.writeHead(200, {"Content-Type": mimetype});
				if (mimetype == "text/css") {
					sql.query("SELECT hue_primary FROM brgy_hue").then(row => {
						content = content.toString().replace(/%sql:brgy_hue:hue_primary%/g, row[0].hue_primary);
						res.write(content);
						res.end();
					});
				}
				else {
					res.write(content);
					res.end();
				}
			}).catch(err => {
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
			});
		}
	}).listen(port, hostname, () => {
		if (server.listening) {
			const listening = server.address();
			console.log("\x1b[36m%s\x1b[0m",`[app] Development server running at ${listening.address} over ${listening.port}...`, "\x1b[0m");
			console.log("\x1b[34m%s\x1b[0m",`[app] http://${hostname}:${port}\x1b[0m`, "\x1b[0m");
		}
	});
});

