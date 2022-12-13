
class JSONTable {

	constructor(url, selector) {
		this.url = url;
		this.selector = selector;
	}

	getData() {
		fetch(this.url, {
			method:"GET",
			headers:{"Content-Type": "application/json"}
		}).then(res => res.json()).then(rows => {
			if (rows.length) {
				let table = document.createElement("table");
				let tr = document.createElement("tr");
				for (var tableheader in rows[0]) {
					let th = document.createElement("th");
					th.innerText = tableheader;
					tr.appendChild(th);
				}
				table.appendChild(tr)
				for (var tablerow of rows) {
					let tr = document.createElement("tr");
					for (var tabledata in tablerow) {
						let td = document.createElement("td");
						td.innerText = tablerow[tabledata];
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
}

