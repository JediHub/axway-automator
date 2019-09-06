export class RestUtil  {
	constructor(baseurl) {
		this.token = "xxxx"
		this.session = 0
		if (baseurl !== undefined) {
			this.baseurl = baseurl
		} else {
			this.baseurl = window.location.protocol+"//"+window.location.hostname+":"+window.location.port+"/api/v1"
		}
	}

	post(url, data, callback) {
		console.log("POST: "+this.baseurl+url)
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4) {
				console.log(this.responseText)
				callback(this.status, JSON.parse(this.responseText));
			}
		};
		xhttp.open("POST", this.baseurl+url, true);
		xhttp.setRequestHeader("Content-type", "application/json");
		xhttp.setRequestHeader("axway-token", this.token)
		xhttp.setRequestHeader("axway-session", this.session)
		xhttp.send(data);
	}

	put(url, data, callback) {
		console.log("PUT: "+this.baseurl+url)
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4) {
				console.log(this.responseText)
				callback(this.status, JSON.parse(this.responseText));
			}
		};
		xhttp.open("PUT", this.baseurl+url, true);
		xhttp.setRequestHeader("Content-type", "application/json");
		xhttp.setRequestHeader("axway-token", this.token)
		xhttp.setRequestHeader("axway-session", this.session)
		xhttp.send(data);
	}

	get(url, callback) {
		console.log("GET: "+this.baseurl+url)
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4) {
				return callback(this.status, JSON.parse(this.response));
			}
		};
		xhttp.open("GET", this.baseurl+url, true);
		xhttp.setRequestHeader("Content-type", "application/json");
		xhttp.setRequestHeader("axway-token", this.token)
		xhttp.setRequestHeader("axway-session", this.session)
		xhttp.send();
	}

	login(user, pwd, server, port, callback) {
		console.log("call login")
		let tt = this
		this.post("/login", JSON.stringify({user: user, pwd: pwd, server: server, port: port}), function(status, val) {
			console.log(val.data)
			tt.token = val.data.token;
			if (tt.session == 0) {
				tt.session = val.data.session
			}
			console.log("token="+tt.token)
			callback(status, val);
		})
	}

	// REST Calls used by grapher for it-self.

	getGraphList(callback) {
		console.log("call getGraphList")
		this.get("/graphs", callback)
	}

	getGraph(id, callback) {
		console.log("call getGraph")
		this.get("/graph/"+id, callback)
	}

	getSubGraph(parentId, id, callback) {
		console.log("call getSubGraph")
		this.get("/graph/"+parentId+"/"+id, callback)
	}
	
	saveGraph(id, data, callback) {
		console.log("call saveGraph")
		this.put("/graph/"+id, data, callback)
	}
}
