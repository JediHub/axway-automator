
import * as d3 from "d3";
import { RestUtil } from "./restUtil";

export class GrapherCommon {

	constructor(restUrl, iconsPath) {
		this.fullData = {}
		this.restUtil = new RestUtil(restUrl)
		this.limitAll = 0.02
		this.limitTotalAll = 0.001
		this.limitGraph = 0.15
		this.limitGraphDetail = 0.3
		this.statusText = ["design", "ready since", "executing since",  "waiting since", "completed at", "error at", "descheduled"]
		this.statusIcon = ["", "", "", "", "checkgreen.png", "FlagDeployError.png", ""]
		this.undoMaxSize = 2000
		this.allowCreate = true
		this.allowDelete = true
		this.allowMove = true
		this.allowMultiSelection = true
		this.linkIcon = 0
		this.spaceBackground = "#E0E0E0"
		this.graphs = {}
		this.newId = 0;
		this.setGStyle()
		if (iconsPath.slice(-1) != "/") {
			this.iconsPath = iconsPath + "/"
		} else {
			this.iconsPath = iconsPath
		}
		this.baseNodeName=[ 
			{ type: "0", base: 'APP_', name: 'v_aname'},
			{ type: "1", base: 'JOB_', name: 'v_jname'}, 
			{ type: "2", base: 'LNK_', name: 'v_usrname'}
		]
	}

	setGStyle() {
		this.statusColor = ["lightgrey", "#f0e024", "#0bacf2", "orange", "lightgreen", "#f05139", "grey"]
		this.linkICon = []
		this.jobW = 140;
		this.jobH = 75;
		this.linkSpaceX = 30//130
		this.linkSpaceY = 30//56
		this.reorgSpacex = 50
		this.reorgSpacey = 30
		this.setDefaultCustomIconList()
	}

	setDefaultCustomIconList() {
		this.customIconList = {}
		this.customIconList['aut_sendfile'] = "aut_sendfile.png"
		this.customIconList['aut_getfile'] = "aut_getfile.png"
		this.customIconList['aut_dup'] = "aut_dup.png"
	}

	getTypeName(node) {
		this.getNodeTypeList
	}

	getNodeTypeList() {
		return {
			"0": { type: "application", icon: "application.gif", name: "Application"},
			"1-0": { type: "job-0", icon: "Engine.png", name: "Job script"},
			"1-3": { type: "job-3", icon: "Job.Type.3.png", name: "Job AS/400"},
			"1-4": { type: "job-4", icon: "Job.Type.4.png", name: "Job AS/400 intercepted"},
			"1-18": { type: "job-18", icon: "Job.Type.18.png", name: "Job AS/400 intercepted in wait"},
			"1-5": { type: "job-5", icon: "Job.Type.5.png", name: "Job SAP"},
			"1-6": { type: "job-6", icon: "Job.Type.6.png", name: "Job SAP intercepted"},
			"1-7": { type: "job-7", icon: "Job.Type.7.png", name: "Job SAP process chain"},
			"1-8": { type: "job-8", icon: "Job.Type.8.png", name: "Job JDE"},
			"1-9": { type: "job-9", icon: "Job.Type.9.png", name: "Job MFT"},
			"1-10": { type: "job-10", icon: "Job.Type.10.png", name: "Job People Soft"},
			"1-11": { type: "job-11", icon: "Job.Type.11.png", name: "Job Pericles"},
			"1-12": { type: "job-12", icon: "Job.Type.12.png", name: "Job Pericles capture"},
			"1-13": { type: "job-13", icon: "Job.Type.13.png", name: "Job Accounting integrator - execute engine"},
			"1-14": { type: "job-14", icon: "Job.Type.14.png", name: "Job Accounting integrator - update engine"},
			"1-15": { type: "job-15", icon: "Job.Type.15.png", name: "Job Accounting integrator - stop"},
			"1-16": { type: "job-16", icon: "Job.Type.16.png", name: "Job Process Manager - response"},
			"1-17": { type: "job-17", icon: "Job.Type.17.png", name: "Job Process Manager - start"},
			"1-19": { type: "job-18", icon: "Job.Type.19.png", name: "Job Process Manager - intermediate"},
			"1-22": { type: "job-22", icon: "Job.Type.20.SOAP.png", name: "Job SOAP Web Service"},
			"1-23": { type: "job-23", icon: "Job.Type.20.REST.png", name: "Job REST Web Service"},
			"1-21": { type: "job-21", icon: "Job.Type.21.png", name: "Job Movex M3"},
			"1-50": { type: "job-50", icon: "Job.Type.50.png", name: "Job custom"},
			"5": { type: "or",icon: "ou.gif", name: "Or"},
			"6": { type: "and",icon: "et.gif", name: "And"},
			"7": { type: "notifWait",icon: "NotifWait.png", name: "Notif wait"},
			"8": { type: "commande",icon: "command.png", name: "Command"},
			"9": { type: "sentinel",icon: "message-sentinel.png", name: "Sentinel"},
			"10": { type: "alertSysAlert",icon: "alert-sys-alert.png", name: "SysAlert alert"},
			"11": { type: "affectation",icon: "affectation.png", name: "Affectation"},
			"12": { type: "test",icon: "test.png", name: "Test"},
			"13": { type: "sendNotification", icon: "NotifSchedule.png", name: "Send notification"},
			"14": { type: "notifMonitor", icon: "NotifMonitor.png", name: "Monitor Notification"},
			"15": { type: "wait", icon: "wait.gif", name: "Wait"},
			"16": { type: "init", icon: "initialization.png", name: "Init"},
			"17": { type: "stop", icon: "extremity.png", name: "Stop"},
			"18": { type: "abort", icon: "abort.png", name: "Abort"},
			"30": { type: "xgraph", icon: "xgraph.png", name: "XGraph"}
		}
	}

	getNodeType(type) {
		let ret = this.nodeType[type]
		if (ret===undefined) {
			return { type: "nc:"+type, icon: "Engine.png"}
		}
		return ret;
	}

	getTextPos(lpos) {
		if (this.gstyle == 0) {
			if (lpos=="0") {
				return ["middle", 15, -10];
			} else if (lpos=="1") {
				return ["start", 31, 0];
			} else if (lpos=="2") {
				return ["start", 31, 12];
			} else if (lpos=="3") {
				return ["start", 31, 20];
			} else if (lpos=="4") {
				return ["middle", 15, 34];
			} else if (lpos=="5") {
				return ["end", -3, 20];
			} else if (lpos=="6") {
				return ["end", -3, 12];
			} else if (lpos=="7") {
				return ["end", -3, 0];
			}
			return ["start", 31, 0];
		} else {
			if (lpos=="0") {
				return ["middle", 12, -11];
			} else if (lpos=="1") {
				return ["start", 27, 0];
			} else if (lpos=="2") {
				return ["start", 27, 8];
			} else if (lpos=="3") {
				return ["start", 27, 16];
			} else if (lpos=="4") {
				return ["middle", 12, 30];
			} else if (lpos=="5") {
				return ["end", -5, 16];
			} else if (lpos=="6") {
				return ["end", -5, 10];
			} else if (lpos=="7") {
				return ["end", -5, 0];
			}
			return ["start", 31, 0];
		}
	}

	getLinkColor(l) {
		if (l.dtype == 7) {
			return "#C8C8C8"
		}
		if (l.typeLink === undefined) {
			return "#000000";
		} else if (l.typeLink=="0") { //Mandatory
			return "#008000"
		} else if (l.typeLink=="1") { //Optional
			return "#000000"
		} else if (l.typeLink=="3") { // Exclusive
			return "#000000";
		} else if (l.typeLink=="4") { // on error
			return "#FF0000";
		} else if (l.typeLink=="5") { // Watchdog
			return "#FF8000";
		} else if (l.typeLink=="5") { // true
			return "#000000";
		} else if (l.typeLink=="6") { // False
			return "#000000";
		} else if (l.typeLink=="7") { // Other
			return "#000000";
		} else if (l.typeLink=="8") { // Optional Deschedulable
			return "#0000FF";
		} else {
			return "#808080"; //other
		}
	}



	computeLink(d) {
		//let source = this.fullData.nodes[d.source];
		//let target = this.fullData.nodes[d.target];
		let source = this.allNodes[d.source];
		let target = this.allNodes[d.target];		
		let x1=source.x+source.w/2
		let y1=source.y+source.h/2
		let x2=target.x+target.w/2
		let y2=target.y+target.h/2

		d.boxed = { 
			xmin : Math.min(source.x, target.x),
			xmax : Math.max(source.x, target.x),
			ymin : Math.min(source.y, target.y),
			ymax : Math.max(source.y, target.y)
		}

		let path1 = ['', [], 0]
		let path2 = ['', [], 0]
		let path

		if (d.dtype == 0) {
			path = this.computeLink0(d, source, target, x1, x2, y1, y2)//escalier
		} else if (d.dtype == 1) {
			path = this.computeLink1(d, source, target, x1, x2, y1, y2)//escalier autre sens
		} else if (d.dtype == 2) {
			path = this.computeLink2(d, source, target, x1, x2, y1, y2)//angle droit
		} else if (d.dtype == 3) {
			path = this.computeLink3(d, source, target, x1, x2, y1, y2)//angle droit autre sens
		} else {
			path = this.computeLink6(d, source, target, x1, x2, y1, y2)//angle droit autre sens
		}
		d.lpath = path
		this.computeLinkEnd(source)
		this.computeLinkEnd(target)
		let pp = this.pathToString(path)
		return this.pathToString(path)
	}

	isUp(source, target) {
		if (target.y >= source.y) {
			return false
		}
		let x1 = source.x
		let y1 = source.y
		let x2 = target.x
		let y2 = target.y
		let d = source.w / source.h
		if ((x2<=x1 && (x1-x2)/(y1-y2)<=d) || (x2>x1 && (x2-x1)/(y1-y2)<=d)) {
			return true
		}
		return false
	}

	isBottom(source, target) {
		if (target.y <= source.y) {
			return false
		}
		let x1 = source.x
		let y1 = source.y
		let x2 = target.x
		let y2 = target.y
		let d = source.w / source.h
		if ((x2<=x1 && (x1-x2)/(y2-y1)<=d) || (x2>x1 && (x2-x1)/(y2-y1)<=d)) {
			return true
		}
		return false
	}

	isLeft(source,  target) {
		if (target.x >= source.x) {
			return false
		}
		let x1 = source.x
		let y1 = source.y
		let x2 = target.x
		let y2 = target.y
		let d = source.h / source.w
		if ((y2<=y1 && (y1-y2)/(x1-x2)<=d) || (y2>y1 && (y2-y1)/(x1-x2)<=d)) {
			return true
		}
		return false
	}


	isRight(source, target) {
		if (target.x <= source.x) {
			return false
		}
		let d = source.h / source.w
		let x1 = source.x
		let y1 = source.y
		let x2 = target.x
		let y2 = target.y
		if ((y2<=y1 && (y1-y2)/(x2-x1)<=d) || (y2>y1 && (y2-y1)/(x2-x1)<=d)) {
			return true
		}
		return false
	}

	isUpLeft(source, target) {
		if (target.y < source.y && target.x<=source.x) {
			return true
		}
		return false
	}


	isUpRight(source, target) {
		if (target.y <= source.y && target.x>source.x) {
			return true
		}
		return false
	}

	isBottomLeft(source, target) {
		if (target.y > source.y && target.x<=source.x) {
			return true
		}
		return false
	}


	isBottomRight(source, target) {
		if (target.y >= source.y && target.x>source.x) {
			return true
		}
		return false
	}

	pathToString(path) {
		if (path.length<2) {
			return ""
		}
		let ret = "M " + Math.floor(path[0]) + " " + Math.floor(path[1])
		for (let i=2; i<path.length; i=i+2) {
			ret = ret + " L " + Math.floor(path[i]) + " " + Math.floor(path[i+1])
		}
		return ret
	}

	computeLinkEnd(node) {
		let list = Object.keys(node.linkPosition['up'])
		if (list.length > 1) {
			let listX = {}
			for (let i=0; i<list.length; i++) {
				let ll = node.linkPosition['up'][list[i]]
				let type = ll[0]
				let path = ll[1]
				let val
				if (type == "source") {
					val = 100000 + Math.floor(path[path.length-2])
				} else {
					val = 100000 + Math.floor(path[0])
				}
				listX[val]=ll
			}
			list = Object.keys(listX)
			let dx = 0
			for (let i=0; i<list.length; i++) {
				let ll = listX[list[i]]
				let type = ll[0]
				let path = ll[1]
				let x = node.x+node.w/2-this.linkSpaceX/2+(this.linkSpaceX/(list.length+1))*(i+1)
				if (path[0] == path[path.length-2]) {
					dx = x - path[0]
				}
				if (type == "source") {
					path[0] = x
					if (path.length!=4) {
						path[2]=x
					}
				} else {
					path[path.length-2] = x
					if (path.length!=4) {
						path[path.length-4]=x
					}
				}
				ll[2].path = this.pathToString(path)
			}
			if (dx!=0) {
				for (let i=0; i<list.length; i++) {
					let ll = listX[list[i]]
					let type = ll[0]
					let path = ll[1]
					if (type == "source") {
						path[0] -= dx
						if (path.length!=4) {
							path[2] -= dx
						}
					} else {
						path[path.length-2] -= dx
						if (path.length!=4) {
							path[path.length-4] -= dx
						}
					}
					ll[2].path = this.pathToString(path)
				}
			}
		}
		list = Object.keys(node.linkPosition['bottom'])
		if (list.length > 1) {
			let listX = {}
			for (let i=0; i<list.length; i++) {
				let ll = node.linkPosition['bottom'][list[i]]
				let type = ll[0]
				let path = ll[1]
				let val
				if (type == "source") {
					val = 100000 + Math.floor(path[path.length-2])
				} else {
					val = 100000 + Math.floor(path[0])
				}
				listX[val]=ll
			}
			list = Object.keys(listX)
			let dx = 0
			for (let i=0; i<list.length; i++) {
				let ll = listX[list[i]]
				let type = ll[0]
				let path = ll[1]
				let x = node.x+node.w/2-this.linkSpaceX/2+(this.linkSpaceX/(list.length+1))*(i+1)
				if (path[0] == path[path.length-2]) {
					dx = x - path[0]
				}
				if (type == "source") {
					path[0] = x
					if (path.length!=4) {
						path[2]=x
					}
				} else {
					path[path.length-2] = x
					if (path.length!=4) {
						path[path.length-4]=x
					}
				}
				ll[2].path = this.pathToString(path)
			}
			if (dx!=0) {
				for (let i=0; i<list.length; i++) {
					let ll = listX[list[i]]
					let type = ll[0]
					let path = ll[1]
					if (type == "source") {
						path[0] -= dx
						if (path.length!=4) {
							path[2] -= dx
						}
					} else {
						path[path.length-2] -= dx
						if (path.length!=4) {
							path[path.length-4] -= dx
						}
					}
					ll[2].path = this.pathToString(path)
				}
			}
		}
		list = Object.keys(node.linkPosition['left'])
		if (list.length > 1) {
			let listY = {}
			for (let i=0; i<list.length; i++) {
				let ll = node.linkPosition['left'][list[i]]
				let type = ll[0]
				let path = ll[1]
				let val
				if (type == "source") {
					val = 100000 + Math.floor(path[path.length-1])
				} else {
					val = 100000 + Math.floor(path[1])
				}
				listY[val]=ll
			}
			list = Object.keys(listY)
			let dy = 0
			for (let i=0; i<list.length; i++) {
				let ll = listY[list[i]]
				let type = ll[0]
				let path = ll[1]
				let y = node.y+node.h/2-this.linkSpaceY/2+(this.linkSpaceY/(list.length+1))*(i+1)
				if (path[1] == path[path.length-1]) {
					dy = y - path[1]
				}
				if (type == "source") {
					path[1] = y
					if (path.length!=4) {
						path[3]=y
					}
				} else {
					path[path.length-1] = y
					if (path.length!=4) {
						path[path.length-3]=y
					}
				}
				ll[2].path = this.pathToString(path)
			}
			if (dy!=0) {
				for (let i=0; i<list.length; i++) {
					let ll = listY[list[i]]
					let type = ll[0]
					let path = ll[1]
					if (type == "source") {
						path[1] -= dy
						if (path.length!=4) {
							path[3] -= dy
						}
					} else {
						path[path.length-1] -= dy
						if (path.length!=4) {
							path[path.length-3] -= dy
						}
					}
					ll[2].path = this.pathToString(path)
				}
			}
		}
		list = Object.keys(node.linkPosition['right'])
		if (list.length > 1) {
			let listY = {}
			for (let i=0; i<list.length; i++) {
				let ll = node.linkPosition['right'][list[i]]
				let type = ll[0]
				let path = ll[1]
				let val
				if (type == "source") {
					val = 100000 + Math.floor(path[path.length-1])
				} else {
					val = 100000 + Math.floor(path[1])
				}
				listY[val]=ll
			}
			list = Object.keys(listY)
			let dy = 0
			for (let i=0; i<list.length; i++) {
				let ll = listY[list[i]]
				let type = ll[0]
				let path = ll[1]
				let y = node.y+node.h/2-this.linkSpaceY/2+(this.linkSpaceY/(list.length+1))*(i+1)
				if (path[1] == path[path.length-1]) {
					dy = y - path[1]
				}
				if (type == "source") {
					path[1] = y
					if (path.length!=4) {
						path[3]=y
					}
				} else {
					path[path.length-1] = y
					if (path.length!=4) {
						path[path.length-3]=y
					}
				}
				ll[2].path = this.pathToString(path)
			}
			if (dy!=0) {
				for (let i=0; i<list.length; i++) {
					let ll = listY[list[i]]
					let type = ll[0]
					let path = ll[1]
					if (type == "source") {
						path[1] -= dy
						if (path.length!=4) {
							path[3] -= dy
						}
					} else {
						path[path.length-1] -= dy
						if (path.length!=4) {
							path[path.length-3] -= dy
						}
					}
					ll[2].path = this.pathToString(path)
				}
			}
		}
	}

	linkInit(node) {
		node.linkPosition = {}
		node.linkPosition['up'] = {}
		node.linkPosition['bottom'] = {}
		node.linkPosition['left'] = {}
		node.linkPosition['right'] = {}
	}

	setLink(node, link, pos, type, path) {
		if (path !== undefined) {
			path[0]= type
			path[2]= link
			delete node.linkPosition['up'][link.id]
			delete node.linkPosition['bottom'][link.id]
			delete node.linkPosition['left'][link.id]
			delete node.linkPosition['right'][link.id]
			node.linkPosition[pos][link.id] = path
		}
	}

	computeLink6(d, source, target, x1, x2, y1, y2) {
		let xf=x2;
		let yf=y2;
		let xs=x1;
		let ys=y1;

		let path1 = ['', [], 0]
		let path2 = ['', [], 0]
		if (this.isBottom(source, target)) { //bas
			this.setLink(source, d, "bottom", 'source', path1)
			this.setLink(target, d, "up", 'target', path2)	
			yf = y2 - target.h/2
			ys = y1 + source.h/2
		}
		else if (this.isUp(source, target)) { //haut
			this.setLink(source, d, "up", 'source', path1)
			this.setLink(target, d, "bottom", 'target', path2)	
			yf = y2 + target.h/2
			ys = y1 - source.h/2
		}
		else if (this.isRight(source, target)) { // right
			this.setLink(source, d, "right", 'source', path1)
			this.setLink(target, d, "left", 'target', path2)	
			xf = x2 - target.w/2
			xs = x1 + source.w/2
		}
		else if (this.isLeft(source, target)) { //left
			this.setLink(source, d, "left", 'source', path1)
			this.setLink(target, d, "right", 'target', path2)	
			xf = x2 + target.w/2
			xs = x1 - source.w/2
		}
		let pathr = [xs, ys, xf, yf]
		path1[1] = pathr
		path2[1] = pathr
		return pathr
	}

	computeLink3(d, source, target, x1, x2, y1, y2) {	
		let xf=x2;
		let yf=y2;
		let xs=x1;
		let ys=y1;
		let path1 = ['', [], 0]
		let path2 = ['', [], 0]
		if (this.isBottom(source, target)) { //bas
			if (Math.abs(x1 - x2) < source.w*1.1) {
				return this.computeLink0(d, source, target, x1, x2, y1, y2)
			}
			ys = y1 + source.h/2
			this.setLink(source, d, "bottom", "source", path1)	
			if (x1 > x2) {
				xf = x2 + target.w/2
				this.setLink(target, d, "right", "target", path2)
			} else {
				xf = x2 - target.w/2
				this.setLink(target, d, "left", "target", path2)
			}
			let pathr = [xs, ys, xs, yf, xf, yf];
			path1[1] = pathr
			path2[1] = pathr
			return pathr
		}
		else if (this.isUp(source, target)) { //haut
			if (Math.abs(x1 - x2) < source.w*1.1) {
				return this.computeLink0(d, source, target, x1, x2, y1, y2)
			}
			ys = y1 - source.h/2
			this.setLink(source, d, "up", "source", path1)	
			if (x1 > x2) {
				xf = x2 + target.w/2
				this.setLink(target, d, "right", "target", path2)
			} else {
				xf = x2 - target.w/2
				this.setLink(target, d, "left", "target", path2)
			}
			let pathr = [xs, ys, xs, yf, xf, yf]
			path1[1] = pathr
			path2[1] = pathr
			return pathr
		}
		else if (this.isRight(source, target)) { // right
			if (Math.abs(y1 - y2) < source.h*1.1) {
				return this.computeLink0(d, source, target, x1, x2, y1, y2)
			}
			this.setLink(source, d, "right", "source", path1)	

			if (y1 > y2) {
				yf = y2 + target.h/2
				this.setLink(target, d, "bottom", "target", path2)
			} else {
				yf = y2 - target.h/2
				this.setLink(target, d, "up", "target", path2)
			}
			let pathr = [xs, ys, xf, ys, xf, yf]
			path1[1] = pathr
			path2[1] = pathr
			return pathr
		}
		else if (this.isLeft(source, target)) { //left
			if (Math.abs(y1 - y2) < source.h*1.1) {
				return this.computeLink0(d, source, target, x1, x2, y1, y2)
			}
			this.setLink(source, d, "left", "source", path1)	
			if (y1 > y2) {
				yf = y2 + target.h/2
				this.setLink(target, d, "bottom", "target", path2)
			} else {
				yf = y2 - target.h/2
				this.setLink(target, d, "up", "target", path2)
			}
			let pathr = [xs, ys, xf, ys, xf, yf];
			path1[1] = pathr
			path2[1] = pathr
			return pathr
		}
		return [xs, ys, xf, yf];
	}

	computeLink2(d, source, target, x1, x2, y1, y2) {
		//if (Math.abs(x1 - x2) <this.jobW*1.3 || Math.abs(y1 - y2)<this.jobH*1.2) {
		//	return this.computeLink0(d, source, target, dx, dy, x1, x2, y1, y2)
		//}	
		let xf=x2;
		let yf=y2;
		let xs=x1;
		let ys=y1;
		let path1 = ['', []]
		let path2 = ['', []]
		if (this.isBottom(source, target)) { //bas	
			if (Math.abs(x1 - x2) < source.w*1) {
				return this.computeLink0(d, source, target, x1, x2, y1, y2)
			}
			this.setLink(target, d, "up", "target", path1)	
			yf = y2 - target.h/2
			xs = x1 - source.w/2
			if (x1 > x2) {
				this.setLink(source, d, "left", "source", path2)
			} else {
				this.setLink(source, d, "right", "source", path2)
			}		
			let pathr = [xs, ys, xf, ys, xf, yf]
			path1[1] = pathr
			path2[1] = pathr
			return pathr
		}
		else if (this.isUp(source, target)) { //haut
			if (Math.abs(x1 - x2) < source.w*1) {
				return this.computeLink0(d, source, target, x1, x2, y1, y2)
			}
			this.setLink(target, d, "bottom", "target", path1)	
			yf = y2 + target.h/2
			xs = x1 + source.w/2
			if (x1 > x2) {
				this.setLink(source, d, "left", "source", path2)
			} else {
				this.setLink(source, d, "right", "source", path2)
			}		
			let pathr = [xs, ys, xf, ys, xf, yf]
			path1[1] = pathr
			path2[1] = pathr
			return pathr
		}
		else if (this.isRight(source, target)) { // right
			if (Math.abs(y1 - y2) < source.h*1) {
				return this.computeLink0(d, source, target, x1, x2, y1, y2)
			}
			this.setLink(target, d, "left", "target", path1)	
			xf = x2 - target.w/2
			if (y1 > y2) {
				ys = y1 - source.h/2
			} else {
				ys = y1 + source.h/2
			}
			if (y1 > y2) {
				this.setLink(source, d, "up", "source", path2)
			} else {
				this.setLink(source, d, "bottom", "source", path2)
			}
			let pathr = [xs, ys, xs, yf, xf, yf]
			path1[1] = pathr
			path2[1] = pathr
			return pathr
		}
		else if (this.isLeft(source, target)) { //left
			if (Math.abs(y1 - y2) < source.h*1) {
				return this.computeLink0(d, source, target, x1, x2, y1, y2)
			}
			this.setLink(target, d, "right", "target", path1)	
			xf = x2 + target.w/2
			if (y1 > y2) {
				ys = y1 - source.h/2
			} else {
				ys = y1 + source.h/2
			}
			if (y1 > y2) {
				this.setLink(source, d, "up", "source", path2)
			} else {
				this.setLink(source, d, "bottom", "source", path2)
			}
			let pathr = [xs, ys, xs, yf, xf, yf]
			path1[1] = pathr
			path2[1] = pathr
			return pathr
		}
		return [xs, ys, xf, xf]
	}

	computeLink1(d, source, target, x1, x2, y1, y2) { 
		if (Math.abs(x1 - x2) <this.jobW*1.3 || Math.abs(y1 - y2)<this.jobH*1.2) {
			return this.computeLink0(d, source, target, x1, x2, y1, y2)
		}
		let xf=x2;
		let yf=y2;
		let xs=x1;
		let ys=y1;
		let path1 = ['', [], 0]
		let path2 = ['', [], 0]
		if (this.isBottom(source, target)) { //bas
			if (x1 > x2) {//gauche
				xf = x2 + target.w/2
				xs = x1 - source.w/2
				this.setLink(source, d, "left", "source", path1)
				this.setLink(target, d, "right", "target", path2)
			} else { //droite
				xf = x2 - target.w/2
				xs = x1 + source.w/2
				this.setLink(source, d, "right", "source", path1)
				this.setLink(target, d, "left", "target", path2)
			}
			let pathr = [
				xs, ys,
				this.computeLinkDepth(d, xs, xf), ys,	
				this.computeLinkDepth(d, xs, xf), yf,
				xf, yf
			]
			path1[1] = pathr
			path2[1] = pathr
			return pathr
		}
		else if (this.isUp(source, target)) { //haut
			if (x1 > x2) {//gauche
				xf = x2 + target.w/2
				xs = x1 - source.w/2
				this.setLink(source, d, "left", "source", path1)
				this.setLink(target, d, "right", "target", path2)
			} else { //droite
				xf = x2 - target.w/2
				xs = x1 + source.w/2
				this.setLink(source, d, "right", "source", path1)
				this.setLink(target, d, "left", "target", path2)
			}
			let pathr = [
				xs, ys,
				this.computeLinkDepth(d, xs, xf), ys,
				this.computeLinkDepth(d, xs, xf), yf,
				xf, yf
			]
			path1[1] = pathr
			path2[1] = pathr
			return pathr
		}
		else if (this.isRight(source, target)) { // right
			if (y1 > y2) { //haut
				yf = y2 + target.h/2
				ys = y1 - source.h/2
				this.setLink(source, d, "up", "source", path1)
				this.setLink(target, d, "bottom", "target", path2)
			} else { //bas
				yf = y2 - target.h/2
				ys = y1 + source.h/2
				this.setLink(source, d, "bottom", "source", path1)
				this.setLink(target, d, "up", "target", path2)
			}
			let pathr = [ 
				xs, ys, 
				xs, this.computeLinkDepth(d, ys, yf),
				xf, this.computeLinkDepth(d, ys, yf),
				xf, yf
			]
			path1[1] = pathr
			path2[1] = pathr
			return pathr
		}
		else if (this.isLeft(source, target)) { //left
			if (y1 > y2) { //haut
				yf = y2 + target.h/2
				ys = y1 - source.h/2
				this.setLink(source, d, "up", "source", path1)
				this.setLink(target, d, "bottom", "target", path2)
			} else { //bas
				yf = y2 - target.h/2
				ys = y1 + source.h/2
				this.setLink(source, d, "bottom", "source", path1)
				this.setLink(target, d, "up", "target", path2)
			}
			let pathr = [
				xs, ys,
				xs, this.computeLinkDepth(d, ys, yf),
				xf, this.computeLinkDepth(d, ys, yf),
				xf, yf
			]
			path1[1] = pathr
			path2[1] = pathr
			return pathr
		}
		return [ xs, ys, xf, yf ] 		
	}

	computeLinkDepth(d, c1, c2) {
		let p = (d.dtype2 + 50) /100 
		if (c1 < c2) {
			return c1 + (c2 - c1) * p
		}
		return c2 + (c1 - c2) * p
	}

	computeLink0(d, source, target, x1, x2, y1, y2) {
		let xf=x2;
		let yf=y2;
		let xs=x1;
		let ys=y1;
		let path1 = ['', [], 0]
		let path2 = ['', [], 0]
		let coef = d.dlink2
		if (this.isBottom(source, target)) { //bas
			this.setLink(source, d, "bottom", "source", path1)
			this.setLink(target, d, "up", "target", path2)
			yf = y2-target.h/2
			ys = y1+source.h/2
			let pathr = [
				xs, ys,
				xs, this.computeLinkDepth(d, ys, yf),
				xf, this.computeLinkDepth(d, ys, yf),
				xf, yf
			]
			path1[1] = pathr
			path2[1] = pathr
			return pathr
		}
		else if (this.isUp(source, target)) { //haut
			this.setLink(source, d, "up", "source", path1)
			this.setLink(target, d, "bottom", "target", path2)
			yf = y2+target.h/2
			ys = y1-source.h/2
			let pathr = [
				xs, ys,
				xs, this.computeLinkDepth(d, ys, yf),
				xf, this.computeLinkDepth(d, ys, yf),
				xf, yf
			]
			path1[1] = pathr
			path2[1] = pathr
			return pathr
		}
		else if (this.isRight(source, target)) { // right
			this.setLink(source, d, "right", "source", path1)
			this.setLink(target, d, "left", "target", path2)
			xf = x2 - target.w/2
			xs = x1 + source.w/2
			let pathr = [
				xs, ys,
				this.computeLinkDepth(d, xs, xf), ys,
				this.computeLinkDepth(d, xs, xf), yf,
				xf, yf
			]
			path1[1] = pathr
			path2[1] = pathr
			return pathr
		}
		else if (this.isLeft(source, target)) { //left
			this.setLink(source, d, "left", "source", path1)
			this.setLink(target, d, "right", "target", path2)
			xf = x2 + target.w/2
			xs = x1 - source.w/2
			let pathr = [
				xs, ys,
				this.computeLinkDepth(d, xs, xf), ys,
				this.computeLinkDepth(d, xs, xf), yf,
				xf, yf
			]
			path1[1] = pathr
			path2[1] = pathr
			return pathr
		}
		return [xs, ys, xf, yf]
	}

	getLinkDash(d) {
		if (d.typeLink == 7) {
			return  ("5, 3");
		}
		return null;
	}

	selectedStrokeWidth(d) {
		return 1;
	}

	computeTotal(graphThis, width, height) {
		this.xmin=undefined
		this.ymin=undefined
		this.xmax=undefined
		this.ymax=undefined
		let tt=this;
		let scale = 1;

		if (this.fullData.nodes === undefined && this.fullData.boxes === undefined) {
			return;
		}

		this.fullData.nodes.forEach(function(node) {
			if (!tt.xmin || node.x < tt.xmin) {
				tt.xmin=node.x
			}
			if (!tt.ymin || node.y < tt.ymin) {
				tt.ymin=node.y
			}
			if (!tt.xmax || node.x + node.w > tt.xmax) {
				tt.xmax=node.x + node.w
			}
			if (!tt.ymax || node.y + node.h > tt.ymax) {
				tt.ymax=node.y + node.h
			}
		})
		this.fullData.boxes.forEach(function(node) {
			if (!tt.xmin || node.x < tt.xmin) {
				tt.xmin=node.x
			}
			if (!tt.ymin || node.y < tt.ymin) {
				tt.ymin=node.y
			}
			if (!tt.xmax || node.x + node.w > tt.xmax) {
				tt.xmax=node.x + node.w
			}
			if (!tt.ymax || node.y + node.h > tt.ymax) {
				tt.ymax=node.y + node.h
			}
		})
		this.xmin -=20
		this.ymin -=20
		this.xmax +=20
		this.ymax +=20

		let ww = (this.xmax - this.xmin);
		let hh = (this.ymax - this.ymin);
		let xm = (this.xmax + this.xmin)/2;
		let ym = (this.ymax + this.ymin)/2;

		let coef1 = width/ww
		let coef2 = width/hh
		let coef3 = height/ww //graph2
		let coef4 = height/hh //graph1
		scale = Math.min(coef1, coef2, coef3, coef4)
		
		if (scale > 3) {
			scale = 3
		}
		graphThis.transform.k = scale //scale/1.2;
		graphThis.transform.x = width/2 - xm * graphThis.transform.k;
		graphThis.transform.y = height/2 - ym * graphThis.transform.k;
		//console.log(this.xmin+","+this.ymin+" - "+this.xmax+","+this.ymax);
	}

	isNodeInArea(area , xp, yp) {
		if (!area) {
			return false;
		}
		let x1 = area[0][0]
		let y1 = area[0][1]
		let x2 = 0;
		let y2 = 0;
		let jw = this.jobW
		let jh = this.jobH
		let nb = 0
		let ii = 1
		//console.log("point: "+xp+","+yp);
		area.forEach(
			function(pt) {
				if (x1!=pt[0]) {
					x2 = pt[0]
					y2 = pt[1]
					if (x2 < x1) {
						x2 = x1;
						y2 = y1;
						x1 = pt[0]
						y1 = pt[1]
					}
					if (xp>=x1 && xp<x2) {
						let aa = (y2-y1)/(x2-x1);
						let yy = (xp - x1) * aa + y1;
						if ( yp < yy) {
							nb++;
							//console.log("("+xp+","+yp+"): ("+x1+","+y1+")->("+x2+","+y2+"): in yy="+yy+ " nb="+nb)
						} else {
							//console.log("("+xp+","+yp+"): ("+x1+","+y1+")->("+x2+","+y2+"): out yy="+yy)
						}
					} else {
						//console.log("("+xp+","+yp+"): ("+x1+","+y1+")->("+x2+","+y2+"): out x");
					}
				}
				ii++;
				x1 = pt[0];
				y1 = pt[1];
			}
		)
		if (nb%2==0) {
			//console.log("point out")
			return false
		}
		//console.log("point in")
		return true;
	}

	activateGraph(id) {
		let graph = this.graphs[id]
		if (graph === undefined) {
			return false
		}
		this.graph = graph
		this.graphId = graph.id
		this.fullData = graph.fullData
		this.allNodes = graph.allNodes
		this.newId = graph.newId
		this.lastNodeNum = graph.lastNodeNum
		this.setGStyle()
		return true
	}

	loadApp(grapher, app) {
		console.log("loadApp")
		if (!app.isApp && !app.isXGraph) {
			return
		}
		let id = app.id
		let parent = this.graphId
		let tt = this
		tt.allowCreate = true
		tt.allowDelete = true
		tt.allowMove = true
		tt.allowMultiSelection = true
		tt.currentApp = app
		grapher.display(id);
		if (app.info['type']=='30') {
			tt.allowCreate = false
			tt.allowDelete = false
			tt.allowMove = false
			tt.allowMultiSelection = false
		}

		if (this.graphs[id] !== undefined) {
			grapher.graphTitle.push(app.text);
			grapher.display(id);
		} else {
			this.getSubGraph(parent, id, function() {
				console.log("app loaded: "+name)
				grapher.graphTitle.push(app.text);
				grapher.display(id);
			})
		}
	}

	loadParent(grapher) {
		let tt = this
		let parent = this.graph.parent
		console.log("load parent: "+ parent)
		grapher.graphTitle.pop()
		grapher.display(parent);
		tt.allowCreate = true
		tt.allowDelete = true
		tt.allowMove = true
		tt.allowMultiSelection = true
	}

	getGraph(id, parent, callback) {
		let graph = {
			id: id,
			fullData: {},
			allNodes: {},
			newId: 0,
			lastNodeNum: {}
		}
		if (parent) {
			graph.parent = parent
		}
		this.graphs[id] = graph
		graph.fullData.nodes=[];
		graph.fullData.links=[];
		graph.fullData.groups=[];
		graph.fullData.boxes=[];
		this.index=0;
		this.boxId=0;
		this.nodeType = this.getNodeTypeList();

		let startTime = new Date().getTime();
		let tt = this
		console.log(id)
		this.restUtil.getGraph(id, function(status, data) {
	     	data.data.forEach(function(info) {
	     		tt.addGraphicObject(info, graph)
	     	})
	     	tt.graph = graph
	     	//tt.convertOldGraphtoNew(graph)
			console.log("import time: "+(new Date().getTime() - startTime)/1000);
			console.log("item nb: "+(graph.fullData.nodes.length+graph.fullData.boxes.length))
			console.log("link nb: "+(graph.fullData.links.length))
			callback();
  		})
	}

	convertOldGraphtoNew(graph) {
		graph.fullData.nodes.forEach(function(node) {
			node.x = node.x * 2.1
			node.y = node.y * 2.1
		})
		graph.fullData.boxes.forEach(function(node) {
			node.x = node.x * 2.1
			node.y = node.y * 2.1
		})
		//tt.display(tt.graphId, tt.node)
	}

	getSubGraph(parentId, id, callback) {
		let graph = {
			id: id,
			fullData: {},
			allNodes: {},
			newId: 0,
			lastNodeNum: {}
		}
		if (parent) {
			graph.parent = parentId
		}
		this.graphs[id] = graph
		graph.fullData.nodes=[];
		graph.fullData.links=[];
		graph.fullData.groups=[];
		graph.fullData.boxes=[];
		this.index=0;
		this.boxId=0;
		this.nodeType = this.getNodeTypeList();

		let startTime = new Date().getTime();
		let tt = this
		this.restUtil.getSubGraph(parentId, id, function(status, data) {
	     	data.data.forEach(function(info) {
	     		tt.addGraphicObject(info, graph)
	     	})
	     	tt.graph = graph
	     	//tt.convertOldGraphtoNew(graph)
			console.log("import time: "+(new Date().getTime() - startTime)/1000);
			console.log("item nb: "+(graph.fullData.nodes.length+graph.fullData.boxes.length))
			console.log("link nb: "+(graph.fullData.links.length))
			callback();
  		})
	}

	loadGraph(id, name, parent, callback) {
		let graph = {
			id: id,
			fullData: {},
			allNodes: {},
			newId: 0,
			lastNodeNum: {}
		}
		if (parent) {
			graph.parent = parent
		}
		this.graphs[id] = graph
		graph.fullData.nodes=[];
		graph.fullData.links=[];
		graph.fullData.groups=[];
		graph.fullData.boxes=[];
		this.index=0;
		this.boxId=0;
		this.nodeType = this.getNodeTypeList();

		let startTime = new Date().getTime();
		let txtFile = new XMLHttpRequest();
		txtFile.open("GET", window.location.protocol+"//"+window.location.hostname+":"+window.location.port+"/import/"+name, true);
		txtFile.send();
		let tt=this;
		txtFile.onreadystatechange = function() {
		  	if (txtFile.readyState === 4) {  // Makes sure the document is ready to parse.
		    	if (txtFile.status === 200) {  // Makes sure it's found the file.
			    	//let lines = txtFile.responseText;
			    	let json = JSON.parse(txtFile.responseText);
			     	let data = json['data']
			     	data.forEach(function(info) {
			     		tt.addGraphicObject(info, graph)
			     		tt.graph = graph
			     	})
					console.log("import time: "+(new Date().getTime() - startTime)/1000);
					console.log("item nb: "+(graph.fullData.nodes.length+graph.fullData.boxes.length))
					console.log("link nb: "+(graph.fullData.links.length))
					callback();
		  		}
			}
		}
	}

	getXYWH(info) {
		if (info['xywh'] == undefined) {
			return
		}
		let tmp = info['xywh'].split(" ")
		return { x: parseInt(tmp[0]), y: parseInt(tmp[1]), w: parseInt(tmp[2]), h: parseInt(tmp[3]) }
	}

	addGraphicObject(info, graph) {
		let type = info['type']
		if (type=='0') { //app
			this.addNode(info, graph);
		} else if (type=="1") { //job
			this.addNode(info, graph);
		} else if (type=="2") { //link
			this.addLink(info, graph);
		} else if (type=="4") { //text
			this.addText(info, graph);
		} else if (type=='8') { // commande
			this.addNode(info, graph)
		} else if (type=='14') { // notif wait
			this.addNode(info, graph)
		} else if (type=='15') { // waiter
			this.addNode(info, graph)
		} else if (type=='16') { //init
			this.addNode(info, graph)
		} else {// unknow
			this.addNode(info, graph)
		}
		this.updateNodeNum(info, graph);
		console.log(graph.lastNodeNum)
	}

	updateNodeNum(info, graph) {
		let name = info.v_jname
		this.baseNodeName.forEach(function(ref) {
			let name = info[ref.name]
			let base = ref.base
			if (name !== undefined) {
				if (name.startsWith(base)) {
					let nn = parseInt(name.substr(4))
					let nref = graph.lastNodeNum[base]
					if (nref === undefined || nn >= nref) {
						graph.lastNodeNum[base] = nn + 1
					}
				}
			}
		})
	}

	getNewId(base) {
		let width = 10;
		let n = this.newId + '';
		this.newId++ 
  		return base + (n.length >= width ? n : new Array(width - n.length + 1).join('0') + n);
	}

	getNewName(info) {
		let tt = this
		this.baseNodeName.forEach(function(ref) {
			if (info.type == ref.type) {
				let base = ref.base
				if (tt.lastNodeNum[base] === undefined) {
					tt.lastNodeNum[base] = 0
				}
				let name = base + tt.lastNodeNum[base];
				tt.lastNodeNum[base]++
				tt.graph.lastNodeNum[base] = tt.lastNodeNum[base]
				info[ref.name] = name
				return
			}
		})
	}

	getText1(text, limit) {
		if (text === undefined) {
			return ""
		}
		return text.substr(0, limit)
	}

	getText2(text, limit) {
		if (text === undefined) {
			return ""
		}
		return text.substr(limit)
	}

	addNode(info, graph) {
		if (graph == undefined) {
			graph = this.graph
		}
		let text = info["v_jname"]
		if (text === undefined) {
			text = info["v_usrname"]
			if (text === undefined) {
				text = info['v_aname']
				if (text === undefined) {
					text = info['v_xname']
					if (text === undefined) {
						text == "";
					}
				}
			}
		}
		let stype = info['type']
		if (stype == '1') {
			stype = stype+"-"+info["f_type"]
		}
		let ntype = this.nodeType[stype]
		if (!ntype) {
			console.log("node type 10, ftype unknow: "+stype);
			return undefined
		}
		let xywh = this.getXYWH(info)
		let w = this.jobW
		let h = this.jobH
		let isJob = true
		let isApp = false
		let isXGraph = false
		let formType = 0
		let textLimit = 23
		if (info['type'] != "1") {
			isJob = false
		}
		let sinfo= info['type']
		if (sinfo == "1" || sinfo == '0' || sinfo == '30') {
			formType = 0
		} else if (sinfo == "5" || sinfo == '6' || sinfo == '16' || sinfo == '17' || sinfo == '18') {
			w = 40
			h = 40
			formType = 3
		} else {
			formType = 2
			w = 120
			h = 55
			textLimit = 18
		}
		if (sinfo == '0') {
			isApp = true
		} else if (sinfo == '30') {
			isXGraph = true
		}
		let icon = ntype.icon
		if (info['f_type'] == '50') {
			let ic = this.customIconList[info['f_ctype']]
			if (ic !== undefined) {
				icon = ic
			}
		}
		let node = {
			gtype: "node",
			id: info['id'],
			isJob: isJob,
			isApp: isApp,
			formType: formType,
			isXGraph: isXGraph,
			x: xywh['x'],
			y: xywh['y'],
			w: w,
			h: h,
			text: this.getText1(text,textLimit),
			text2: this.getText2(text, textLimit),
			textpos: this.getTextPos(info["f_lpos"]),
			type: ntype.type,
			icon: icon,
			typeName: ntype.name,
			status: 0,
			linkPosition: {},
			info: info
		}
		this.linkInit(node)
		graph.fullData.nodes.push(node);
		graph.allNodes[node.id]=node;
		return node
	}

	addLink(info, graph) {
		if (graph == undefined) {
			graph = this.graph
		}
		let from = graph.allNodes[info["from"]];
		let to = graph.allNodes[info["to"]]
		if (from && to) {
			let source = info["from"]
			let target = info["to"]
			let dtype = 0
			if (info["dtype"] !== undefined) {
				dtype = parseInt(info["dtype"])
			}
			let dtype2 = 0
			if (info["dtype2"] !== undefined) {
				dtype2 = parseInt(info["dtype2"])
			}
			let inf = info.info
			if (inf === undefined) {
				inf = info
			}
			let link = {
				gtype: "link",
				id: info['id'],
				source: source,
				target: target,
				typeLink: info['ltype'],
				dtype: dtype,
				dtype2: dtype2,
				move: 0,
				info: inf
			}
			link.boxed = 
			{ 
				xmin : Math.min(from.x, to.x),
				xmax : Math.max(from.x, to.x),
				ymin : Math.min(from.y, to.y),
				ymax : Math.max(from.y, to.y)
			}
			graph.fullData.links.push(link);
			graph.allNodes[link.id] = link
			return link
		}
	}

	addText(info, graph) {
		if (graph == undefined) {
			graph = this.graph
		}
		let x = info['x'];
		let y = info['y'];
		let w = info['w'];
		let h = info['h'];
		let tmp = info["v_desc"].split("\n");
		let tmp2=[];
		let texts=[];
		let b=true;
		for (let i=0; i<tmp.length; i++) {
			if (b || tmp[i].trim()!="") {
				texts.push(tmp[i].trim())
				b=false;
			}
		}
		let tt=this;

		let box = {
			gtype: "box",
			id: info['id'],
			x: x,
			y: y,
			w: w,
			h: h,
			color: this.convertColor(true, info["back_color"]),
			opacity: 100,
			typeName: "text",
			info: info
		}
		if (info["back_color"] == "" || info["back_color"] === undefined) {
			box.opacity = 0
		}
		this.boxId++;
		graph.fullData.boxes.push(box);
		graph.allNodes[box.id]=box;

		let yy=(h-texts.length*12)/2+8;
		let ltext = [];
		texts.forEach(
			function(text) {
				let node = {
					gtype: "text",
					id: info['id'],
					x: w/2,
					y: yy,
					box: box,
					text: text,
					color: tt.convertColor(false, info["fore_color"]),
				}
				yy=yy+12;
				ltext.push(node);
			}
		)
		box.texts = ltext;
		return box;
	}	

	convertColor(back, rvb) {
		if (!rvb || rvb=="") {
			if (back) {
				//return d3.rgb(255, 255, 192);
				return d3.rgb(254, 254, 224);
			}
			return "black";
		}
		let col=rvb.split(",")
		return d3.rgb(parseInt(col[0]), parseInt(col[1]), parseInt(col[2]));
	}

	saveGraph(id, callback) {
		let data = {}
		let tt = this
		let graph = this.graph
		if (id != "current") {
			graph = this.graphs[id]
		}
		if (graph ===undefined) {
			callback("graph not found");
			return false
		}
		data.existing_objs = []
		data.new_objs_data = []
		graph.fullData.nodes.forEach(function(node) {
			let obj = tt.getNodeSaveForGraph(node)
			data.existing_objs.push(obj)
			if (obj.id.startsWith("NE")) {
				data.new_objs_data.push(tt.getNodeSaveForData(node))
			}
		})
		/*
		graph.fullData.boxes.forEach(function(text) {
			data.objects.push(tt.getTextJson(text))
		})
		*/
		graph.fullData.links.forEach(function(link) {
			let obj = tt.getLinkSaveForGraph(link)
			data.existing_objs.push(obj)
		})
		let json = JSON.stringify(data)
		console.log(data)
		this.restUtil.saveGraph(graph.id, json, callback);

	}

	getNodeSaveForGraph(node) {
		let info = node.info
		let obj = {
			"type":	info.type,
			"v_desc": info.v_desc,
			"v_groupexec":	info.v_groupexec,
			"xywh":	node.x+" "+node.y+" "+node.w+" "+node.h,
			"id": node.id
		}
		if (node.type == "1") {
			obj.v_jname = info.v_jname
			obj.f_lpos = info.f_lpos
		} else if (node.type == "0") {
			obj.v_aname = info.v_aname
		}
		return obj
	}

	getNodeSaveForData(node) {
		let data = {}
		data.id_agent = "AG0000000001";
		data.id_user = "US0000000001";
		data.id_plng = "PL0000000001";
		Object.keys(node.info).forEach(function(key) {
			if (key!='id' && key!="v_groupexec") {
				data[key] = node.info[key]
			}
		})
		data['id_key'] = node.id
		if (node.type == "1") {
			data['v_msg_def'] = { 'v_msg_def' : ""}
			data['v_data_file'] = { 'v_data_file': ""}
		}
		return data
	}

	getTextJson(node) {
		node.info['xywh'] = node.x+" "+node.y+" "+node.w+" "+node.h
		return node.info
	}

	getLinkSaveForGraph(link) {
		link.info['dtype'] = link.dtype
		//link.info['dtype2'] = link.dtype2
		console.log(link)
		let info = link.info
		let obj = {
			"type":	info.type,
			"v_desc": info.v_desc,
			"v_groupexec":	info.v_groupexec,
			"v_usrname":	info.v_usrname,
			"from": info.from,
			"to": info.to,
			"f_lpos": info.f_lpos,
			"xywh": "0 0 0 0",
			"ltype": info.ltype,
			"id": link.id,
			"dtype": link.dtype,
			"dtype2": link.dtype2
		}
		return obj
	}

	getLinkedNodes(node) {
		let list = []
		let tt = this
		this.fullData.links.forEach(function(link) {
			if (link.source == node.id) {
				let nn = tt.allNodes[link.target]
				if (nn) {
					list.push(nn)
				}
			}
		})
		return list
	}

	reorgNodes(sens) {
		if (!this.allowMove) {
			return
		}
		if (sens == "h") {
			this.reorgSpacex = 60
			this.reorgSpacey = 10
		} else {
			this.reorgSpacex = 40
			this.reorgSpacey = 30
		}
		let tt = this
		let maxLevel = this.initReog(sens)
		this.reorgNodeTree(sens, maxLevel)
		this.reorgLinks(sens)
		this.moveRootNodes(sens)
		this.fullData.nodes.forEach(
			function(node) {
				tt.linkInit(node)
			}
		)
		this.fullData.links.forEach(
			function(link) {
				link.path = tt.computeLink(link)
			}
		)
		this.fullData.nodes.forEach(
			function(node) {
				tt.computeLinkEnd(node)
			}
		)
	}

	reorgLinks(sens) 
	{
		let tt = this
		this.fullData.links.forEach(function(link) {
			let n1 = tt.allNodes[link.source]
			let n2 = tt.allNodes[link.target]
			if (link.dtype != 7) {
				if (sens == 'h') {
					link.dtype = 0
					if (tt.isUp(n1, n2) || tt.isBottom(n1, n2)) {
						link.dtype = 1
					}
				} else {
					link.dtype = 0
					if (tt.isLeft(n1, n2) || tt.isRight(n1, n2)) {
						link.dtype = 1
					}
				}
			}
		})
		this.fullData.nodes.forEach(function(node) {
			let listLink = []
			for (let i=0; i<tt.fullData.links.length;i++) {
				let link = tt.fullData.links[i]
				if (link.source==node.id) {
					listLink.push(link)
				}
			}
			let list = node.children;
			if (list.length == 3) {
				tt.setLinkdtype2(listLink, node.id, list[0].id, -10)
				tt.setLinkdtype2(listLink, node.id, list[1].id, 10)
				tt.setLinkdtype2(listLink, node.id, list[2].id, -10)
			} else if (list.length == 4) {
				tt.setLinkdtype2(listLink, node.id, list[0].id, -20)
				//tt.setLinkdtype2(listLink, node.id, list[1].id, 	0)
				//tt.setLinkdtype2(listLink, node.id, list[2].id, 	0)
				tt.setLinkdtype2(listLink, node.id, list[3].id, -20)
			} else if (list.length == 5) {
				tt.setLinkdtype2(listLink, node.id, list[0].id, -20)
				//tt.setLinkdtype2(listLink, node.id, list[1].id, 	0)
				tt.setLinkdtype2(listLink, node.id, list[2].id, 20)
				//tt.setLinkdtype2(listLink, node.id, list[3].id, 	0)
				tt.setLinkdtype2(listLink, node.id, list[4].id, -20)
			} else if (list.length == 6) {
				tt.setLinkdtype2(listLink, node.id, list[0].id, -20)
				//tt.setLinkdtype2(listLink, node.id, list[1].id, 	0)
				tt.setLinkdtype2(listLink, node.id, list[2].id, 20)
				tt.setLinkdtype2(listLink, node.id, list[3].id, 20)
				//tt.setLinkdtype2(listLink, node.id, list[4].id, 	0)
				tt.setLinkdtype2(listLink, node.id, list[5].id, -20)
			} else if (list.length == 7) {
				tt.setLinkdtype2(listLink, node.id, list[0].id, -20)
				//tt.setLinkdtype2(listLink, node.id, list[1].id, 	0)
				tt.setLinkdtype2(listLink, node.id, list[2].id, 20)
				tt.setLinkdtype2(listLink, node.id, list[3].id, 40)
				tt.setLinkdtype2(listLink, node.id, list[4].id, 20)
				//tt.setLinkdtype2(listLink, node.id, list[5].id, 	0)
				tt.setLinkdtype2(listLink, node.id, list[6].id, -20)
			} else if (list.length == 8) {
				tt.setLinkdtype2(listLink, node.id, list[0].id, -20)
				//tt.setLinkdtype2(listLink, node.id, list[1].id, 	0)
				tt.setLinkdtype2(listLink, node.id, list[2].id, 20)
				tt.setLinkdtype2(listLink, node.id, list[3].id, 40)
				tt.setLinkdtype2(listLink, node.id, list[4].id, 40)
				tt.setLinkdtype2(listLink, node.id, list[5].id, 20)
				//tt.setLinkdtype2(listLink, node.id, list[6].id, 	0)
				tt.setLinkdtype2(listLink, node.id, list[7].id, -20)
			} else if (list.length == 9) {
				tt.setLinkdtype2(listLink, node.id, list[0].id, -20)
				//tt.setLinkdtype2(listLink, node.id, list[1].id, 	0)
				tt.setLinkdtype2(listLink, node.id, list[2].id, 20)
				tt.setLinkdtype2(listLink, node.id, list[3].id, 40)
				tt.setLinkdtype2(listLink, node.id, list[3].id, 60)
				tt.setLinkdtype2(listLink, node.id, list[4].id, 40)
				tt.setLinkdtype2(listLink, node.id, list[5].id, 20)
				//tt.setLinkdtype2(listLink, node.id, list[6].id, 	0)
				tt.setLinkdtype2(listLink, node.id, list[7].id, -20)
			}
		})
	}

	setLinkdtype2(list, id1, id2, val) {
		let link = this.getLink(list, id2)
		if (link !== undefined) {
			link.dtype2 = val
		}
	}

	getLink(list, id2) {
		for (let i=0; i<list.length;i++) {
			let link = list[i]
			if (link.target==id2) {
				return  link
			}
		}
		return undefined
	}

	initReog(sens) {
		let tt = this
		this.setGStyle()
		//init des nodes
		this.fullData.nodes.forEach(function(node) {
			node.parents = []
			node.children = []
			node.treeW = tt.jobW
			node.treeH = tt.jobH
			if (sens == 'h') {
				node.info["f_lpos"] = "1"
				node.textpos= tt.getTextPos(node.info["f_lpos"])
			} else {
				node.info["f_lpos"] = "4"
				node.textpos= tt.getTextPos(node.info["f_lpos"])
			}
		})
		//creation de tous les liens
		this.fullData.links.forEach(function(link) {
			link.dtype = 6
			link.dtype2 = 0
			let n1 = tt.allNodes[link.source]
			let n2 = tt.allNodes[link.target]
			if (n2.parents.length==0) {
				n1.children.push(n2)
				n2.parents.push(n1)
			} else {
				link.dtype = 7
			}
		})
		//calcul des levels
		this.fullData.nodes.forEach(function(node) {
			if (node.parents.length == 0) {
				node.level = 0
				tt.setNodeLevel(node)
			}
		})
		//supression des links re-entrants
		this.fullData.links.forEach(function(link) {
			let n1 = tt.allNodes[link.source]
			let n2 = tt.allNodes[link.target]
			if (n1.level>=n2.level) {
				link.dtype = 7
				for (let i=0; i<n1.children.length;i++) {
					if (n1.children[i].id == n2.id) {
						n1.children.splice(i, 1)
						break;
					}
				}
				for (let i=0; i<n2.parents.length;i++) {
					if (n2.parents[i].id == n1.id) {
						n2.parents.splice(i, 1)
						break;
					}
				}
			}
		})
		//calcul du level max
		let maxLevel = 0
		this.fullData.nodes.forEach(function(node) {
			if (node.level > maxLevel) {
				maxLevel = node.level
			}
		})
		return maxLevel
	}

	setNodeLevel(node) {
		let tt = this
		node.children.forEach(function(nn) {
			if (nn.level === undefined || nn.level > node.level+1) {
				nn.level = node.level+1
			}
			tt.setNodeLevel(nn)
		})
	}

	reorgNodeTree(sens, maxLevel) {
		let tt= this
		for (let level=maxLevel-1; level>=0; level--) {
			this.fullData.nodes.forEach(function(node) {
				if (node.level == level) {
					let size = { width: 0, height: 0 }
					node.children.forEach(function(nn) {
						size.width += (nn.treeW + tt.reorgSpacex)
						size.height += (nn.treeH + tt.reorgSpacey)
					})
					size.width -= tt.reorgSpacex
					size.height -= tt.reorgSpacey
					tt.moveNodeTrees(node, size, sens, level)	
					tt.computeTreeSize(node)					
				}
			})
		}
	}

	moveNodeTrees(node, size, sens, level) {
		let x = node.x
		let y = node.y
		if (sens == 'h') {
			y = y - size.height/2
		} else {
			x = x - size.width/2
		}
		let tt = this
		node.children.forEach(function(nn) {
			let xn = 0
			let yn = 0
			if (sens == 'h') { 
				xn = node.x + (node.w + tt.reorgSpacex) 
				yn = y + nn.treeH/2
				y += nn.treeH + tt.reorgSpacey
			} else {
				yn = node.y + (node.h + tt.reorgSpacey) 
				xn = x + nn.treeW/2
				x += nn.treeW + tt.reorgSpacex
			}
			let dx = xn - nn.x
			let dy = yn - nn.y
			tt.moveNodeTree(nn, dx, dy)
		})
	}

	moveNodeTree(node, dx, dy) {
		node.x += dx
		node.y += dy
		//this.snapToGrid(node)
		let tt = this
		let list = node.children
		list.forEach(function(nn) {
			tt.moveNodeTree(nn, dx, dy)
		})
	}

	computeTreeSize(node) {
		let xmin = node.x
		let xmax = node.x + this.jobW
		let ymin = node.y
		let ymax = node.y + this.jobH
		let size = { xmin: xmin, ymin: ymin, xmax: xmax, ymax: ymax }
		this.computeChildrenSize(node, size)
		node.treeW = size.xmax - size.xmin
		node.treeH = size.ymax - size.ymin
	}

	computeChildrenSize(node, size) {
		let tt = this
		node.children.forEach(function(nn) {
			if (nn.x < size.xmin) {
				size.xmin = nn.x
			}
			if (nn.y < size.ymin) {
				size.ymin = nn.y
			}
			if (nn.x + nn.w > size.xmax) {
				size.xmax = nn.x + nn.w
			}
			if (nn.y + nn.h > size.ymax) {
				size.ymax = nn.y + nn.h
			}
			tt.computeChildrenSize(nn, size)
		})
	}

	snapToGrid(node) {
		this.gridStep = 10;
		let xx = Math.floor(node.x);
		let yy = Math.floor(node.y);
		xx = xx - (xx % this.gridStep);
		yy = yy - (yy % this.gridStep);
		node.x = xx
		node.y = yy
	}

	moveRootNodes(sens) {
		let x0 = 40
		let y0 = 40
		let x = x0
		let y = y0
		let tt = this
		this.fullData.boxes.forEach(
			function(box) {
				box.x = -40 - box.w
				box.y = y
				y += (box.h + tt.reorgSpacey)
			}
		)
		y = y0
		this.fullData.nodes.forEach(
			function(node) {
				if (node.parents.length == 0 && node.children.length == 0) {
					node.x = x
					node.y = y
					x += (tt.jobW + tt.reorgSpacex) 
					if (x > 1200) {
						x = x0
						y += (tt.jobH + tt.reorgSpacey)
					}
				}
			}
		)	
		x = x0
		y += (tt.jobH + tt.reorgSpacey)
		y0 = y
		let xn = 0
		let yn = 0
		this.fullData.nodes.forEach(
			function(node) {
				if (node.parents.length == 0 && node.children.length != 0) {
					if (sens == 'h') {
						yn = y + node.treeH/2
						xn = x0
						y += (node.treeH + tt.reorgSpacey)
					} else {
						xn = x + node.treeW/2
						yn = y0
						x += (node.treeW + tt.reorgSpacex)
					}
					tt.moveNodeTree(node, xn - node.x, yn - node.y)
					node.x = xn
					node.y = yn
				}
			}
		)
	}

	setCustomIconList(list) {
		this.customIconList = list
	}

	getJobDefault() {
		return {
			"type":         "1",
			"f_pertype":	"1",
			"n_perfreq":	"0",
			"f_cycle":		"0",
			"v_cycle":		"000000",
			"t2_atearly":	"000000",
			"t2_atlater":	"992359",
			"t2_hdepsuc":	"000000",
			"f_herit":		"1",
			"f_mode":		"2",
			"f_depsuc":		"1",
			"f_lvl_err":	"0",
			"id_plng":		"PL0000000001",
			"id_user":		"US0000000001",
			"id_agent":		"AG0000000001",
			"f_bloqplan":	"0",
			"v_script":		"",
			"v_path":		"",
			"v_rpath":		"",
			"f_joblog": 	"1",
			"f_keep_exec":	"0",
			"v_rscript":	"",
			"f_relauto": 	"0",
			"v_desc": 		"",
			"v_groupexec":  "",
			"f_ctype":	    "",
			"f_type":  		"0",
			"f_lpos":		"1",
			"v_jname": 		"JOB_0" 
		}
	}

	getAppDefault() {
		return {
			"type": 	    "0",
			"f_pertype":	"1",
			"n_perfreq":	"0",
			"f_cycle":		"0",
			"v_cycle":		"000000",
			"t2_atearly":	"000000",
			"t2_atlater":	"992359",
			"t2_hdepsuc":	"000000",
			"f_herit":		"1",
			"f_mode":		"2",
			"f_depsuc":		"1",
			"f_lvl_err":	"0",
			"id_plng":		"PL0000000001",
			"id_user":		"US0000000001",
			"id_agent":		"AG0000000001",
			"v_groupexec":	"",
			"v_aname": "app_0",
			"v_desc": "",
			"v_jobd": "",
			"vb_jobd": "",
			"v_jobq": "",
			"vb_jobq": ""
		}	
	}

	getLinkDefault() {
		return {			
			"type":	"2",
			"v_desc": "",
			"v_groupexec":	"",
			"v_usrname":	"LNK_0",
			"from": "",
			"to": "",
			"xywh": "0 0 0 0",
			"ltype": "0"
		}
	}

//end class

}
