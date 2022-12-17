
class JSONTable {

	constructor(url, selector) {
		this.url = url;
		this.selector = selector;
	}

	// Arr is an array of columns to include
	getData(Arr) {
		fetch(this.url, {
			method:"GET",
			headers:{"Content-Type": "application/json"}
		}).then(res => res.json()).then(rows => {
			return rows.map(row => this.flatten(row));
		}).then(async rows => {
			if (rows.length) {
				let table = document.createElement("table");
				let tr = document.createElement("tr");
				tr.classList.add("row-0");
				for (var tableheader in rows[0]) {
					if (Arr && !Arr.includes(tableheader)) continue;
					let th = document.createElement("th");
					th.classList.add("col-"+tableheader);
					th.innerText = tableheader;
					tr.appendChild(th);
				}
				table.appendChild(tr)
				for (var tablerow of rows) {
					let tr = document.createElement("tr");
					tr.classList.add("row-"+rows.indexOf(tablerow));
					for (var tabledata in tablerow) {
						if (Arr && !Arr.includes(tabledata)) continue;
						let td = document.createElement("td");
						td.classList.add("col-"+tabledata);
						switch(tabledata) {
						case "email":
							const mailto = document.createElement("a");
							mailto.innerText = tablerow[tabledata];
							mailto.href = "mailto:"+mailto.innerText;
							td.appendChild(mailto);
							break;
						case "tel":
							const tel = document.createElement("a");
							tel.innerText = tablerow[tabledata];
							tel.href = "tel:"+tel.innerText.replace(/\s|-|\(|\)/g,"");
							td.appendChild(tel);
							break;
						default:
							const timestamp = Date.parse(tablerow[tabledata]);
							if (timestamp) {
								const tzoffset = await this.getTZOffset();
								const localtime = new Date(parseInt(timestamp) + parseInt(tzoffset));
								td.innerText = localtime.toLocaleString();
							} else {
								td.innerText = tablerow[tabledata];
							}
						}
						tr.appendChild(td);
					}
					table.appendChild(tr)
				}
				table.classList.add("sortable");
				return table
			}
		}).then(table => {
			if (table) {
				document.querySelector(this.selector).replaceChildren(table);
			}

		});
	}

	// No nested tables
	flatten (obj = [], path = "") {
		if (typeof obj === "object") {
			return Object.keys(obj).reduce((output, key) => {
				return {...output, ...this.flatten(obj[key], key)};
			}, {});
		} else {
			return { [path] : obj };
		}
	}

	async getTZOffset () {
		return await fetch("/query?tzinfo").then(res => res.json()).then(tz => tz.tzoffset);
	};

}

