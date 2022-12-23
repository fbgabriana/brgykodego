const mysql = require("mysql");
const http = require("http");
const fs = require("fs");
const util = require("util");
const mime = require("mime-types");

const auth = require(`./auth.js`);
const cipher = require(`./cipher.js`);
const querystring = require("querystring");
const dbconfig = require("./db.config.js");

const sql = mysql.createPool({
	user: dbconfig.user,
	host: dbconfig.host,
	password: dbconfig.password,
	database: dbconfig.database
});

sql.query = util.promisify(sql.query).bind(sql);
fs.readFile = util.promisify(fs.readFile).bind(fs);
cipher.salt = dbconfig.user + dbconfig.host;

const host = {
	hostname: "0.0.0.0",
	port: process.env.PORT || 9000
};

const app_version = `${process.env.npm_package_name}-${process.env.npm_package_version}`;
const app_homepage = process.env.HOME == "/app" ? require(process.env.npm_package_json).homepage : `http://${process.env.npm_package_name}.localhost:${host.port}`;

const publicpath = "./public";

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
	return fs.readFile(`${publicpath}/sidebar.html`, "utf8").then(sidebar => {
		return content.replace("<!-- sidebar -->", sidebar)
	});
}).then(content => {

	const app = (req, res) => {
		const pathArr = req.url.slice(1).split("?");
		let [ filename, q, search ] = [ pathArr[0] || "home", pathArr[1], "" ];
		let templateHTML = content;

		if (filename.indexOf(".") == -1) {
			templateHTML = fs.existsSync(`public/css/pages/${filename}.css`) ? templateHTML.replace("%req:current-page%", filename) : templateHTML.replace(/^.*%req:current-page%.*$\n/mg, "");
			templateHTML = fs.existsSync(`public/js/pages/${filename}.js`) ? templateHTML.replace("%req:current-page%", filename) : templateHTML.replace(/^.*%req:current-page%.*$\n/mg, "");

			let userAuth = req.headers.cookie ? querystring.parse(req.headers.cookie,"; ").u : null;
			sql.query("SELECT username, hash, authlevel, userinfo FROM users").then(users => {
				users.map(user => { user.userinfo = JSON.parse(user.userinfo) });
				return users;
			}).then(users => {

			let currentuser = null;
			if (userAuth) {
				for (user of users) {
					if (user.username === cipher.decrypt(userAuth.slice(1))) {
						currentuser = user;
					}
				}
			}

			const now = new Date().toISOString().slice(0, 19).replace("T", " ");
			let content = "";
			switch (filename) {
			case "home":
				req.on("data", chunk => {search += chunk});
				req.on("end", async () => {
					if (search) {
						referer = new URL(req.headers.referer);
						if (referer.href.replace(referer.origin,"") === req.url) {
							const formpost = querystring.parse(search);
							formpost["bulletin_date_created"] = now;
							formpost["bulletin_classification_icon"] = ["project-update","news-update","waterservice","calamity"][formpost["bulletin_classification_id"] - 1];
							formpost["bulletin_details"] = `<p>${formpost["bulletin_details"]}</p>`.replaceAll(/\n/g,"</p><p>");
							await sql.query(`INSERT INTO brgy_bulletin (
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
					}
					sql.query("SELECT bulletin_id, bulletin_classification_id, bulletin_classification_icon, bulletin_classification_title, bulletin_classification_subtitle, bulletin_details, bulletin_image_filename, bulletin_date_created FROM brgy_bulletin").then(result => {
						res.writeHead(200, {"Content-Type": "text/html"});
						if (q && q.includes("post")) {
							content += `				<script>auth.require(2);</script>
				<!-- add new bulletin post -->
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
						} else {
							if (currentuser) {
								content += `				<h2 class="welcome user-auth${currentuser.authlevel}">Welcome ${currentuser.userinfo.displayname}</h2>`;
								if (currentuser.authlevel >= 2) {
									content += `				<div class="admin-post"><button onclick="location='/?post'">Post an announcement</button></div>`;
									content += `				<div class="admin-dash"><a href="/dash">[ Manage ]</a></div>`;
								}
							}
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
				).then(() => {
					req.on("data", chunk => {search += chunk});
					req.on("end", async () => {
						if (search) {
							referer = new URL(req.headers.referer);
							if (referer.href.replace(referer.origin,"") === req.url) {
								const formpost = querystring.parse(search);
								formpost["logbook_datetime_utc"] = now;
								await sql.query(`INSERT INTO logbook (
									logbook_displayname,
									logbook_message,
									logbook_datetime_utc
								) VALUES (
									'${formpost["logbook_displayname"]}',
									'${formpost["logbook_message"]}',
									'${formpost["logbook_datetime_utc"]}'
								)`);
							}
						}
						sql.query("SELECT logbook_displayname, logbook_message, logbook_datetime_utc FROM logbook").then(result => {
							content = `				<script>auth.require(1);</script>
				<!-- begin logbook -->
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
				});
				break;
			case "post":
				sql.query("CREATE TABLE IF NOT EXISTS formdata( \
					id INT UNIQUE NOT NULL AUTO_INCREMENT, \
					formdata_referer VARCHAR(255) NOT NULL, \
					formdata_datetime_utc DATETIME NOT NULL, \
					formdata_query VARCHAR(2047) NOT NULL, \
					PRIMARY KEY(id))",
				).then(() => {
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
								formdata_datetime_utc,
								formdata_query
							) VALUES (
								'${referer}',
								'${formpost["posted"]}',
								'${displayresultText}'
							)`);

							content += `<h1>Thank you</h1>\n<p class="received">We received your message.</p><p>You have entered:</p>\n${displayresultHTML}\n`;
							content += `<div><p>The information has been saved in our database.</p></div>\n`;

							if (recipient = formpost["recipient"]) {
								// sendmail(recipient, content);
							}
							if (redirect = formpost["redirect"]) {
								res.writeHead(307, {"Location": `${redirect}?${q}`});
								return res.end();
							}
							content += `<div><p><a class="goback" href="${referer}" onclick="history.back()">[ Back to Previous Page ]</a></p></div>`;
						}
						res.writeHead(200, {"Content-Type": "text/html"});
						res.write(templateHTML.replace("<!-- content -->", content));
						return res.end();
					});
				});
				break;
			case "query":
				req.on("data", chunk => {search += chunk});
				req.on("end", async () => {
					switch (q) {
					case "colortheme":
						switch (req.method) {
						case "GET":
							sql.query(`SELECT
								hsl_id,
								hsl_hue,
								hsl_saturation,
								hsl_lightness,
								rgb_hex
							FROM brgy_colors_hsl`).then(row => {
								res.writeHead(200, {"Content-Type": "application/json"});
								res.write(JSON.stringify(row[1]));
								res.end();
							});
							break;
						case "POST":
							const pref = JSON.parse(search);
							sql.query(`REPLACE INTO brgy_colors_hsl (
								hsl_id,
								hsl_hue,
								hsl_saturation,
								hsl_lightness,
								rgb_hex
							) VALUES (
								'${parseInt(pref["hue_id"])}',
								'${parseFloat(pref["hsl_hue"])}',
								'${parseFloat(pref["hsl_saturation"])}',
								'${parseFloat(pref["hsl_lightness"])}',
								'${pref["rgb_hex"]}'
							)`).then(packet => {
								res.writeHead(307, {"Location": `${req.headers.referer}`});
								return res.end();
							});
							break;
						default:
							res.writeHead(405);
							content = `<h1>${res.statusCode.toString()} ${res.statusMessage.toString()}</h1><p>The request method '${req.method}' is not supported by the target resource '${req.url}'.</p>`;
							res.write(templateHTML.replace("<!-- content -->", content));
							return res.end();
							break;
						}
						break;
					case "messages":
						sql.query(`SELECT
							formdata_datetime_utc,
							formdata_query
						FROM
							formdata
						WHERE
							formdata_referer = '/contact'`
						).then(async formdata => {
							let json = [];
							for (row of formdata.reverse()) {
								let datetime = row.formdata_datetime_utc;
								let arr = [`"timestamp":"${datetime}"`];
								let cols = row.formdata_query.replace(/,$/,"").split(/,\n/);
								for (col of cols) {
									let entries = col.split(": ");
									arr.push(`"${entries[0]}":"${entries[1]}"`);
								}
								str = arr.join(",");
								json.push(`{${str}}`);
							}
							res.writeHead(200, {"Content-Type": "application/json"});
							res.write(JSON.stringify(JSON.parse(`[${json}]`)));
							res.end();
						}).catch(err => {
							res.writeHead(200, {"Content-Type": "application/json"});
							res.write(`[]`);
							res.end();
						});
						break;
					case "users":
						switch (req.method) {
						case "GET":
							res.writeHead(200, {"Content-Type": "application/json"});
							if (currentuser && currentuser.authlevel >= 2) {
								res.write(JSON.stringify(users));
							} else {
								res.write("[]");
							}
							res.end();
							break;
						case "POST":
							const update = JSON.parse(search);
							if (update.userinfo) {
								for (var user of users) {
									if (user.username == update.username) {
										update.hash = user.hash;
										break;
									}
								}
								if (update.password) {
									await auth.hashPassword(update.password).then(hash => update.hash = hash);
								}
								delete update.password;
								update.userinfo = JSON.stringify(update.userinfo);
								sql.query(`REPLACE INTO users (
									username,
									hash,
									authlevel,
									userinfo
								) VALUES (
									'${update.username}',
									'${update.hash}',
									'${update.authlevel}',
									'${update.userinfo}'
								)`);
								// console.log(user)
								// console.log(update);
								res.writeHead(200, {"Content-Type": "application/json"});
								res.write(JSON.stringify(update));
								res.end();
							} else {
								sql.query(`DELETE FROM users WHERE username='${update.username}'`).then(update => {
								res.writeHead(200, {"Content-Type": "application/json"});
								res.write(JSON.stringify(update));
								res.end();
								});
							}
							break;
						}
						break;
					case "tzinfo":
						let utctime = new Date(Date.UTC(0, 0, 0, 0, 0, 0));
						let localtime = new Date();
						let tz = Object.create(null);
						tz.tzoffset  = 0 - 1000 * 60 * parseInt(utctime.getTimezoneOffset());
						tz.GMTOffset = utctime.toLocaleDateString(undefined,{day:"2-digit",timeZoneName:"long"}).slice(4);
						tz.UTCOffset = tz.GMTOffset.replace("GMT","UTC");
						tz.LongName  = localtime.toLocaleDateString(undefined,{day:"2-digit",timeZoneName:"long"}).slice(4);
						tz.abbr = tz.LongName.split(" ").map(s => s[0]).join("");
						res.writeHead(200, {"Content-Type": "application/json"});
						res.write(JSON.stringify(tz));
						res.end();
						break;
					case "env":
						res.writeHead(200, {"Content-Type": "application/json"});
						res.write("[" + Object.keys(process.env).sort().map(key =>`{"Name":"${key}","Value":"${process.env[key]}"}`).toString() + "]");
						res.end();
						break;
					default:
						res.writeHead(200, {"Content-Type": "application/json"});
						res.write(`[]`);
						res.end();
					}
				});
				break;
			case "auth":
				if (req.method == "GET") {
					if (currentuser && req.headers.referer) {
						const referer = new URL(req.headers.referer); referer.path = `${referer.href.replace(referer.origin,"")}`;
						res.writeHead(403);
						content = `<h1>${res.statusCode.toString()} ${res.statusMessage.toString()}</h1><p>User '${currentuser.userinfo.displayname}' has insufficient privileges to access ${referer.path}.</p>`;
						res.write(templateHTML.replace("<!-- content -->", content));
						return res.end();
					} else {
						res.writeHead(400);
						content = `<h1>${res.statusCode.toString()} ${res.statusMessage.toString()}</h1><p>The request sent to the server is invalid.</p>`;
						res.write(templateHTML.replace("<!-- content -->", content));
						return res.end();
					}
				}
				req.on("data", chunk => {search += chunk});
				req.on("end", () => {
					if (search) {
						const login = querystring.parse(search);
						if (!login.username) {
							res.writeHead(401);
							content = `<h1>${res.statusCode.toString()} ${res.statusMessage.toString()}</h1><p>User has not supplied any login credentials.</p>`;
							res.write(templateHTML.replace("<!-- content -->", content));
							return res.end();
						}
						for (var user of users) {
							if (user.username == login.username) {
								login.found = true;
								auth.comparePassword(login.password, user.hash).then(comp => {
									if (comp == true) {
										// Login successful
										let from = new URL(req.headers.referer).search.slice(1);
										token = `${user.authlevel}${cipher.encrypt(user.username)}`;
										res.writeHead(307, {"Set-Cookie": `u=${token}; c=299792458`, "Location": `${from || "/"}`});
										return res.end();
									} else {
										res.writeHead(401);
										content = `<h1>${res.statusCode.toString()} ${res.statusMessage.toString()}</h1><p>User '${user.username}' supplied incorrect login credentials.</p>`;
										res.write(templateHTML.replace("<!-- content -->", content));
										return res.end();
									}
								});
								break;
							}
						}
						if (!login.found) {
							res.writeHead(401);
							content = `<h1>${res.statusCode.toString()} ${res.statusMessage.toString()}</h1><p>User '${login.username}' does not exist in our system.</p>`;
							res.write(templateHTML.replace("<!-- content -->", content));
							return res.end();
						}
					} else {
						res.writeHead(307, {"Location": req.headers.referer || req.headers.origin});
						return res.end();
					}
				});
				break;
			case "env":
				content = "<pre>\n" + Object.keys(process.env).sort().map(key =>`${key}=${process.env[key]}`).join("\n") + "\n</pre>";
				res.writeHead(200, {"Content-Type": "text/html"});
				res.write(templateHTML.replace("<!-- content -->", content));
				return res.end();
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
			}});
		} else {
			fs.readFile(`${publicpath}/${filename}`).then(content => {
				let mimetype = mime.lookup(filename);
				res.writeHead(200, {"Content-Type": mimetype});
				if (mimetype == "text/css") {
					sql.query("SELECT hsl_hue FROM brgy_colors_hsl").then(row => {
						content = content.toString().replace(/%sql:brgy_hue:hue_primary%/g, row[1].hsl_hue);
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
	}

	const server = http.createServer(app).listen(host.port, host.hostname).on("error", err => {
		console.log(`\x1b[31m${err.message}\x1b[0m`);
		process.exit(0);
	}).on("listening", () => {
		const socketAddress = server.address();
		console.log("\x1b[36m%s\x1b[0m",`[app] ${app_version}`, "\x1b[0m");
		console.log("\x1b[36m%s\x1b[0m",`[app] Development server started ${new Date()}`, "\x1b[0m");
		console.log("\x1b[36m%s\x1b[0m",`[app] Running at ${socketAddress.address} over ${socketAddress.port}...`, "\x1b[0m");
		console.log("\x1b[34m%s\x1b[0m",`[app] ${app_homepage}\x1b[0m`, "\x1b[0m");
	});
});

