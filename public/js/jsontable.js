
class JSONTable {

	constructor(url, selector) {
		this.url = url;
		this.selector = selector;
	}

	getData(Arr) {
		fetch(this.url, {
			method:"GET",
			headers:{"Content-Type": "application/json"}
		}).then(res => res.json()).then(async rows => {
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
						case "timestamp":
							let tzoffset = await getTZOffset();
							let utcdate = new Date(tablerow[tabledata]);
							let localtime = new Date(parseInt(utcdate.getTime()) + parseInt(tzoffset));
							td.innerText = localtime.toLocaleString();
							break;
						case "email":
							let mailto = document.createElement("a");
							mailto.innerText = tablerow[tabledata];
							mailto.href = "mailto:"+mailto.innerText;
							td.appendChild(mailto);
							break;
						case "tel":
							let tel = document.createElement("a");
							tel.innerText = tablerow[tabledata];
							tel.href = "tel:"+tel.innerText.replace(/\s|-|\(|\)/g,"");
							td.appendChild(tel);
							break;
						default:
							td.innerText = tablerow[tabledata];
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
}

