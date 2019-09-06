
import * as d3 from "d3";

export  class Grapher {

	constructor(common, width, height) {
		this.common = common;
		this.iconsPath = common.iconsPath
		this.width = width;
		this.height = height;
		this.viewId = false;
		this.svg = null;
		this.data  = {}
		this.selectedGraphs = {};
		this.selectAreaMinDist = (common.jobW/4) * (common.jobW/4);
		this.transform = d3.zoomIdentity
		//let rect = document.querySelector("#graphs").getBoundingClientRect()
		this.x0=0;//rect.x;
		this.y0=0;//rect.y;
		//
		this.grid = true;
		this.updated = false;
		this.gridStep = 10;
		if (common.graphTotal !== undefined) {
			common.graphTotal.graphs = this
			this.graphTotal = common.graphTotal
		}
		this.common.currentGrapher = this
		this.undo = []
		this.undoIndex = 0
		this.mode = "info"
		this.prettyOption = { x0: 100, y0: 100, dx: 20, dy: 20}
		//
		this.linkP = 0
		this.nodeT = 15
		this.linkIcon = common.linkIcon
		this.graphTitle = []
	}

	init(node) {
		this.node = node;
	}

	display(id) {
		this.x0 = this.node.x;
		this.y0 = this.node.y;
		this.zoom = d3.zoom()
		let tt = this
		//let bcol = "#F8F8F8"
		let bcol = this.common.spaceBackground
		this.graphId = id
		if (!this.common.activateGraph(id)) {
			return false
		}

		if (this.nodeInfo === undefined) {
			this.nodeInfo = d3.select("body").append("div")	
				.attr("id", "grapher-tooltip")
				.attr("class", "tooltip")				
				.style("opacity", 0);
		}

		this.svg = d3.select(this.node)
			.style("background", bcol)
			//.attr("class", "grapher-space")
			.on("wheel", 
				function() {
					if (tt.selectedLink!==undefined) {
						if (d3.event.deltaY>0) {
							tt.updateLink(1)
						} else {
							tt.updateLink(-1)
						}
					}
					else {
						tt.zoomed()
					}
				}
			)
		this.setKeyboard();
		this.setMouse();
		if (this.common.fullData.links) {
			this.common.fullData.nodes.forEach(this.common.linkInit.bind(this.common))
			this.common.fullData.links.forEach(
				function(link) {
					link.path = tt.common.computeLink(link)
				}
			)
		}
		this.redisplay(true);
		if (this.graphTotal !== undefined) {
			this.computeTotalRect(this.graphTotal);
			this.graphTotal.redisplayBox();	
		}
		setTimeout(function() {
			tt.common.fullData.links.forEach(
				function(link) {
					link.path = tt.common.computeLink(link)
				}
			)
			tt.redisplay(true)
		}, 1000)
	}

	marker0(color) {
        this.svg.append("svg:marker")
			.attr("id", color.replace("#", ""))
			.attr("viewBox", "10 -5 10 10")
			.attr("refX", 5)
			.attr("refY", 0)
			.attr("markerWidth", 6)
			.attr("markerHeight", 6)
			.attr("orient", "auto")
			.attr("markerUnits", "userSpaceOnUse")
			.append("svg:path")
			//.attr("d", "M0,-5L10,0L0,5")
			.attr("d", "M0,-5L10,0L10,5")
			.style("fill", color);
        return "url(" + color + ")";
    }

	marker1() {
        this.svg.append("svg:marker")
			.attr("id", "arrow")
			.attr("viewBox", "0 0 12 12")
			.attr("refX", 9)
			.attr("refY", 6)
			.attr("markerWidth", 12)
			.attr("markerHeight", 12)
			.attr("orient", "auto")
			.attr("markerUnits", "userSpaceOnUse")
			.append("svg:path")
			//.attr("d", "M0,-5L10,0L0,5")
			.attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2")
			.style("fill", "#000000");
        return "url(#arrow)";
    }

    gradients(id, color) {
		this.svg.append("radialGradient")
			.attr("id", id)
			.attr("cx", "50%")	//not really needed, since 50% is the default
			.attr("cy", "50%")	//not really needed, since 50% is the default
			.attr("r", "50%")	//not really needed, since 50% is the default
			.selectAll("stop")
			.append("stop")
			.data([
				{offset: "50%", color:  this.common.spaceBackground},
				//{offset: "95%", color: this.common.spaceBackground},
				{offset: "100%", color: color}
			])
			.enter().append("stop")
			.attr("offset", function(d) { return d.offset; })
			.attr("stop-color", function(d) { return d.color; });
    }

	redisplay(computeLinks, notRedisplayTotal) {
		let startTime = new Date().getTime();
		d3.selectAll("svg.agrapher >*").remove();
		if (this.common.fullData.nodes === undefined && this.common.fullData.boxed === undefined) {
			return;
		}
		this.marker1()
		/*
		this.gradients("red-gradient", "red")
		this.gradients("green-gradient", "green")
		this.gradients("orange-gradient", "orange")
		this.gradients("white-gradient", "white")
		*/
		
		this.clip();

		let tt=this;
		
		if (computeLinks) {
			this.data.nodes.forEach(this.common.linkInit.bind(this.common))
			this.data.links.forEach(
				function(link) {
					link.path = tt.common.computeLink(link)
				}
			)	
			this.data.nodes.forEach(this.common.computeLinkEnd.bind(this.common))
		}

		if (this.grid) {
			//this.displayGrid();
		}

		if (this.data.links) {
			if (this.transform.k>this.common.limitGraph) {
				this.displayLinks(computeLinks)
			}
		}

		if (this.data.nodes) {
			this.data.nodes.forEach(function(node) {
				//pour les chagement de gstyle, a supprimer apres choix
				//node.textpos = tt.common.getTextPos(node.info["F_LPOS"])
				//
				if (node.formType == 2) {
					tt.displayNode2(node)
				} else if (node.formType == 0) {
					tt.displayNode0(node)
				} else {
					tt.displayNode1(node)
				}
			})
		}

		if (this.data.boxes) {
			if (this.transform.k>this.common.limitAll) {
				this.data.boxes.forEach(function(box) {
					tt.displayTextBox(box)
				})

				if (this.boxHandlers) {
					this.displayHandlers()
				}
			}
		}

		if (this.common.graph.parent !== undefined ) {
			this.displayParentLabel(this.common.currentApp)
		}

		if (!notRedisplayTotal && this.graphTotal !== undefined) {
			this.graphTotal.redisplay()
		}
		console.log("redisplay time: "+(new Date().getTime() - startTime));
	}
	
	node2Path(node) {
		let dd = 10
		let path = [
			node.x, node.y,
			node.x + node.w -dd , node.y,
			node.x + node.w, node.y + dd,
			node.x + node.w, node.y + node.h,
			node.x + dd, node.y + node.h,
			node.x, node.y + node.h - dd,
			node.x, node.y
		]
		return this.common.pathToString(path)
	}

	node2PathState(node) {
		let dd = 10
		let hh = 32
		let path = [
			node.x, node.y + hh,
			node.x + node.w, node.y + hh,
			node.x + node.w, node.y + node.h,
			node.x + dd, node.y + node.h,
			node.x, node.y + node.h - dd,
			node.x, node.y + node.h - hh,
		]
		return this.common.pathToString(path)

	}

	displayNode0(node) {
		let tt = this
		if (this.transform.k>this.common.limitAll) {
			this.svg.append("g")
				//.selectAll("rect")
				.data([node])
				//.enter()
				.append("rect")
					.attr("transform", tt.transform.toString())
					.attr("class", "grapher-nodes")
					.attr("rx", function(d) { if (d.isApp || d.isXGraph) return 0; else return 10; })
					.attr("ry", function(d) { if (d.isApp || d.isXGraph) return 0; else return 10; })
					.attr("x", function(d) { return d.x})
					.attr("y", function(d) { return d.y})
					.attr("width", function(d) { return d.w})
					.attr("height", function(d) { return d.h})
					.attr("fill", function(b) { return tt.getNodeFill(b) })
					.attr("stroke", "black")
					.attr("stroke-width", tt.getNodeStokeWidth.bind(tt))
					//.on("mousedown", this.selectGraph.bind(this))
					//.style("opacity", 0.5)//for debug link
					.on("mouseenter", this.tooltipEnter.bind(tt))
					.on("mouseleave", this.tooltipLeave.bind(tt))
					.call(d3.drag()
						.on("start", this.dragstarted.bind(tt))
						.on("drag", this.dragged.bind(tt))
						.on("end", this.dragended.bind(tt)))

			
			if (node.formType==0) {
				this.svg.append("g")
					//.selectAll("rect")
					.data([node])
					//.enter()
					.append("rect")
						.attr("transform", tt.transform.toString())
						.attr("class", "grapher-nodes")
						.attr("x", function(d) { return d.x+2})
						.attr("y", function(d) { return d.y+30})
						.attr("width", function(d) { return d.w-4 })
						.attr("height", 25)
						.attr("fill", function(d) { return tt.common.statusColor[d.status]; })
						.attr("stroke", "lightgrey")
						.attr("stroke-width", "0")
						.on("mouseenter", this.tooltipEnter.bind(tt))
						.on("mouseleave", this.tooltipLeave.bind(tt))
						.call(d3.drag()
							.on("start", this.dragstarted.bind(tt))
							.on("drag", this.dragged.bind(tt))
							.on("end", this.dragended.bind(tt)))
			}

			if (node.isXGraph) {
				this.svg.append("g")
					.data([node])
					.append("rect")
						.attr("transform", tt.transform.toString())
						.attr("class", "grapher-nodes")
						.attr("x", function(d) { return d.x+3})
						.attr("y", function(d) { return d.y+3 })
						.attr("width", function(d) { return d.w-6})
						.attr("height", function(d) { return d.h-6})
						.attr("fill", "none")
						.attr("stroke", "black")
						.attr("stroke-width", "1")
						.call(d3.drag()
							.on("start", this.dragstarted.bind(tt))
							.on("drag", this.dragged.bind(tt))
							.on("end", this.dragended.bind(tt)))
			}

		} else {
			this.svg.append("g")
				this.svg.append("rect")
					 .attr("transform", tt.transform.toString())
					 .attr("x", tt.common.xmin)
					 .attr("y", tt.common.ymin)
					 .attr("width", (tt.common.xmax-tt.common.xmin))
					 .attr("height", (tt.common.ymax-tt.common.ymin))
					 .attr("stroke", "black")
					 .attr("stroke-width", 1/tt.transform.k)
					 .attr("fill", "white")
					 .on("mouseenter", this.tooltipEnter.bind(tt))
					 .on("mouseleave", this.tooltipLeave.bind(tt))
		}

		if (this.transform.k>this.common.limitGraphDetail) {			
			this.svg.append("g")
				.attr("class", "grapher-nodes")
				.data([node])
				.append("image")
					.attr("transform", tt.transform.toString())
					.attr("x", function(d) { 
						if (node.formType==0) return d.x + 5; else return d.x + d.w/2 - 10 
					})
					.attr("y", function(d) { if (d.formType==3) return d.y + 10; else return d.y  + 5 })
					.attr("xlink:href", function(d) { return tt.iconsPath+d.icon; })
				  	.attr("width", "20px")
				  	.attr("height", "20px")
				  	.on("mouseenter", this.tooltipEnter.bind(tt))
					.on("mouseleave", this.tooltipLeave.bind(tt))
				  	.on("mouseup", function(d) { tt.common.loadApp(tt, d); })

			this.svg.append("g")
				.data([node])
				.append("text")
				.attr("transform", tt.transform.toString())
				.attr("class", "grapher-textnode")
				.attr("x", function(d) { if (d.formType==0) return d.x + 28; else return d.x + d.w/2; })
				.attr("y", function(d) { if (d.text2=="") return d.y + 13; else return d.y + 7 })
				.attr("text-align", "center")
				.attr("dy", ".70em")
				.attr("dx", ".10em")
				.attr("text-anchor", function(d) { if (d.formType==0) return "start"; else return "middle"; })
				.text(function(d) { if (tt.viewId) return tt.customText(d); else return d.text })
				.on("mouseenter", this.tooltipEnter.bind(tt))
				.on("mouseleave", this.tooltipLeave.bind(tt))
				.call(d3.drag()
					.on("start", this.dragstarted.bind(tt))
					.on("drag", this.dragged.bind(tt))
					.on("end", this.dragended.bind(tt)))
				

			if (node.text2 != "") {
				this.svg.append("g")
					.data([node])
					.append("text")
					.attr("transform", tt.transform.toString())
					.attr("class", "grapher-textnode")
					.attr("x", function(d) { return d.x + 28 })
					.attr("y", function(d) { return d.y + 19 })
					.attr("text-align", "center")
					.attr("dy", ".70em")
					.attr("dx", ".10em")
					.attr("text-anchor", "start")
					.text(function(d) { return d.text2 })
					.on("mouseenter", this.tooltipEnter.bind(tt))
					.on("mouseleave", this.tooltipLeave.bind(tt))
			}

			if (node.status>0) {
				this.svg.append("g")
					.data([node])
					.append("text")
					.attr("transform", tt.transform.toString())
					.attr("class", "grapher-textnode")
					.attr("x", function(d) { return d.x + 10 })
					.attr("y", function(d) { return d.y + 13+20 })
					.attr("text-align", "center")
					.attr("dy", ".70em")
					.attr("dx", ".10em")
					.attr("text-anchor", "start")
					.text(function(d) { if (tt.viewId) return tt.customText(d); else return d.statusText })
					.on("mouseenter", this.tooltipEnter.bind(tt))
					.on("mouseleave", this.tooltipLeave.bind(tt))
					.call(d3.drag()
						.on("start", this.dragstarted.bind(tt))
						.on("drag", this.dragged.bind(tt))
						.on("end", this.dragended.bind(tt)))

				this.svg.append("g")
					.data([node])
					.append("text")
					.attr("transform", tt.transform.toString())
					.attr("class", "grapher-textnode")
					.attr("x", function(d) { return d.x + 10 })
					.attr("y", function(d) { return d.y + 13+10+20 })
					.attr("text-align", "center")
					.attr("dy", ".70em")
					.attr("dx", ".10em")
					.attr("text-anchor", "start")
					.text(function(d) { if (tt.viewId) return tt.customText(d); else return d.date })
					.on("mouseenter", this.tooltipEnter.bind(tt))
					.on("mouseleave", this.tooltipLeave.bind(tt))
					.call(d3.drag()
						.on("start", this.dragstarted.bind(tt))
						.on("drag", this.dragged.bind(tt))
						.on("end", this.dragended.bind(tt)))

				this.svg.append("g")
				.attr("class", "grapher-nodes")
				//.selectAll("image")
				.data([node])
				//.enter()
				.append("image")
					.attr("transform", tt.transform.toString())
					.attr("x", function(d) { 
						if (node.formType==0) return d.x + 5; else return d.x + d.w/2 - 10 
					})
					.attr("y", function(d) { if (d.formType==3) return d.y + 10; else return d.y  + 5 })
					.attr("xlink:href", function(d) { return tt.iconsPath+d.icon; })
					.attr("width", "20px")
					.attr("height", "20px")
					.on("mouseenter", this.tooltipEnter.bind(tt))
					.on("mouseleave", this.tooltipLeave.bind(tt))
					.on("mouseup", function(d) { tt.common.loadApp(tt, d); })

			}

			if (node.status > 0) {
				this.svg.append("g")
				.attr("class", "grapher-nodes")
				.data([node])
				.append("image")
					.attr("transform", tt.transform.toString())
					.attr("x", function(d) { return d.x + 5})
					.attr("y", function(d) { return d.y + 60 })
					.attr("xlink:href", function(d) { return tt.getIconStatus(d) })
					.on("mouseenter", this.tooltipEnter.bind(tt))
					.on("mouseleave", this.tooltipLeave.bind(tt))
				  	.attr("width", "10px")
				  	.attr("height","10px")			
			}

			if (node.isCyclic ) {
				this.svg.append("g")
				.attr("class", "grapher-nodes")
				//.selectAll("image")
				.data([node])
				//.enter()
				.append("image")
					.attr("transform", tt.transform.toString())
					.attr("x", function(d) { return d.x + 5 + 12})
					.attr("y", function(d) { return d.y + 60})
					.attr("xlink:href", tt.iconsPath+"Flag.274877906944.png" )
				  .attr("width", "10px")
				  .attr("height","10px")
			}

			if (tt.common.statusIcon[node.status] != "") {
				this.svg.append("g")
				.attr("class", "grapher-nodes")
				.data([node])
				.append("image")
				.attr("transform", tt.transform.toString())
				.attr("x", function(d) { return d.x  + d.w - 28})
				.attr("y", function(d) { return d.y  + 30 })
				.attr("xlink:href", function(d) {
					return tt.iconsPath+tt.common.statusIcon[d.status]
				})
				.attr("width", "25px")
				.attr("height","25px")			
			}
		} 
	}

	getNodeFill(node) {
		if (node.formType==0) {
			return "#F0F0F0";
		} else {
			return this.common.statusColor[node.status]
		}
	}

	displayNode2(node) {
		let tt = this
		if (this.transform.k>this.common.limitAll) {
			this.svg.append("g")
				.data([node])
				.append("path")
					.attr("transform", tt.transform.toString())
					.attr("class", "grapher-nodes")
					.attr("d", function(d) { return tt.node2Path(d) })
					.attr("fill", "white")
					.attr("stroke", "black")
					.attr("stroke-width", tt.getNodeStokeWidth.bind(tt))
					//.on("mousedown", this.selectGraph.bind(this))
					//.style("opacity", 0.5)//for debug link
					.on("mouseenter", this.tooltipEnter.bind(tt))
					.on("mouseleave", this.tooltipLeave.bind(tt))
					.call(d3.drag()
						.on("start", this.dragstarted.bind(tt))
						.on("drag", this.dragged.bind(tt))
						.on("end", this.dragended.bind(tt)))

			this.svg.append("g")
				.data([node])
				.append("path")
					.attr("transform", tt.transform.toString())
					.attr("class", "grapher-nodes")
					.attr("d", function(d) { return tt.node2PathState(d) })
					.attr("fill", function(d) { return tt.getNodeFill(d) })
					.attr("stroke", "black")
					.attr("stroke-width", tt.getNodeStokeWidth.bind(tt))
					//.style("opacity", 0.5)//for debug link
					.on("mouseenter", this.tooltipEnter.bind(tt))
					.on("mouseleave", this.tooltipLeave.bind(tt))
					.call(d3.drag()
						.on("start", this.dragstarted.bind(tt))
						.on("drag", this.dragged.bind(tt))
						.on("end", this.dragended.bind(tt)))

		} 
		if (this.transform.k>this.common.limitGraphDetail) {
			
			this.svg.append("g")
				.attr("class", "grapher-nodes")
				.data([node])
				.append("image")
					.attr("transform", tt.transform.toString())
					.attr("x", function(d) { return d.x  + 5 })
					.attr("y", function(d) { return d.y  + 5 })
					.attr("xlink:href", function(d) { return tt.iconsPath+d.icon; })
				 	.attr("width", "20px")
				  	.attr("height", "20px")
					.on("mouseenter", this.tooltipEnter.bind(tt))
					.on("mouseleave", this.tooltipLeave.bind(tt))
					.call(d3.drag()
						.on("start", tt.dragstarted.bind(tt))
						.on("drag", tt.dragged.bind(tt))
						.on("end", tt.dragended.bind(tt)));
			
			this.svg.append("g")
				.data([node])
				.append("text")
				.attr("transform", tt.transform.toString())
				.attr("class", "grapher-textnode")
				.attr("x", function(d) { return d.x + 26 })
				.attr("y", function(d) { if (d.text2=="") return d.y + 13; else return d.y + 7 })
				.attr("text-align", "center")
				.attr("dy", ".70em")
				.attr("dx", ".10em")
				.attr("text-anchor", "start")
				.text(function(d) { if (tt.viewId) return tt.customText(d); else return d.text })
				.on("mouseenter", this.tooltipEnter.bind(tt))
				.on("mouseleave", this.tooltipLeave.bind(tt))
				.call(d3.drag()
					.on("start", this.dragstarted.bind(tt))
					.on("drag", this.dragged.bind(tt))
					.on("end", this.dragended.bind(tt)))
				

			if (node.text2 != "") {
				this.svg.append("g")
					.data([node])
					.append("text")
					.attr("transform", tt.transform.toString())
					.attr("class", "grapher-textnode")
					.attr("x", function(d) { return d.x + 26 })
					.attr("y", function(d) { return d.y + 19 })
					.attr("text-align", "center")
					.attr("dy", ".70em")
					.attr("dx", ".10em")
					.attr("text-anchor", "start")
					.text(function(d) { return d.text2 })
					.on("mouseenter", this.tooltipEnter.bind(tt))
					.on("mouseleave", this.tooltipLeave.bind(tt))
					.call(d3.drag()
						.on("start", this.dragstarted.bind(tt))
						.on("drag", this.dragged.bind(tt))
						.on("end", this.dragended.bind(tt)))
			}

			if (tt.common.statusIcon[node.status] != "") {
				this.svg.append("g")
				.attr("class", "grapher-nodes")
				.data([node])
				.append("image")
				.attr("transform", tt.transform.toString())
				.attr("x", function(d) { return d.x  + d.w - 19}                           )
				.attr("y", function(d) { return d.y  + d.h - 19 })
				.attr("xlink:href", function(d) {
					return tt.iconsPath+tt.common.statusIcon[d.status]
				})
				.attr("width", "18px")
				.attr("height","18px")	
				.on("mouseenter", this.tooltipEnter.bind(tt))
				.on("mouseleave", this.tooltipLeave.bind(tt))		
			}
		} 
	}

	displayNode1(node) {
		let tt = this
		if (this.transform.k>this.common.limitAll) {
			this.svg.append("g")
				.data([node])
				.append("rect")
					.attr("transform", tt.transform.toString())
					.attr("class", "grapher-nodes")
					.attr("x", function(d) { return d.x})
					.attr("y", function(d) { return d.y})
					.attr("width", function(d) { return d.w})
					.attr("height", function(d) { return d.h})
					.attr("fill", function(b) { return tt.getNodeFill(b) })
					.attr("stroke", "black")
					.attr("stroke-width", tt.getNodeStokeWidth.bind(tt))
					.on("mouseenter", this.tooltipEnter.bind(tt))
					.on("mouseleave", this.tooltipLeave.bind(tt))
					.call(d3.drag()
						.on("start", this.dragstarted.bind(tt))
						.on("drag", this.dragged.bind(tt))
						.on("end", this.dragended.bind(tt)))

		} else {
			this.svg.append("g")
				this.svg.append("rect")
					 .attr("transform", tt.transform.toString())
					 .attr("x", tt.common.xmin)
					 .attr("y", tt.common.ymin)
					 .attr("width", (tt.common.xmax-tt.common.xmin))
					 .attr("height", (tt.common.ymax-tt.common.ymin))
					 .attr("stroke", "black")
					 .attr("stroke-width", 1/tt.transform.k)
					 .attr("fill", "white")
		}

		if (this.transform.k>this.common.limitGraphDetail) {			
			this.svg.append("g")
				.attr("class", "grapher-nodes")
				.data([node])
				.append("image")
					.attr("transform", tt.transform.toString())
					.attr("x", function(d) { return d.x + d.w/2 - 10 })
					.attr("y", function(d) { return d.y + 10 })
					.attr("xlink:href", function(d) { return tt.iconsPath+d.icon; })
				  	.attr("width", "20px")
				  	.attr("height", "20px")
				  	.on("mouseenter", this.tooltipEnter.bind(tt))
					.on("mouseleave", this.tooltipLeave.bind(tt))
					.call(d3.drag()
						.on("start", this.dragstarted.bind(tt))
						.on("drag", this.dragged.bind(tt))
						.on("end", this.dragended.bind(tt)))
		}
	}

	getIconStatus(d) {
		if (d.status == 1) {
			return this.iconsPath+"Flag.256.png";
		} else if (d.status == 2) {
			return this.iconsPath+"Flag.512.png";
		} else if (d.status == 3) {
			return this.iconsPath+"Flag.Normal.png";
		} else if (d.status == 4) {
			return this.iconsPath+"Flag.128.png";
 		}
	}

	getIconLink(d) {
		if ( d.typeLink == "1" || d.typeLink == "2" ) {
			return this.iconsPath+"Flag.17179869184.png"
		} else if (d.typeLink == "4") {
			return this.iconsPath+"Flag.8589934592.png";
		} else {
			return this.iconsPath+"checkgreen.png";
		}
	}

	displayTextBox(box) {
		let tt = this
		this.svg.append("g")
		 	.data([box])
		 	.append("rect")
		 	.attr( "class", "grapher-box")
	 		.attr("transform", this.transform.toString())
			.attr("x", box.x)
			.attr("y", box.y)
		 	.attr("width", box.w)
		 	.attr("height", box.h)
		 	.attr("stroke-width", this.getNodeStokeWidth(box))
		 	.style("fill", box.color)
		 	.attr("stroke", "black")
		 	.style("opacity", box.opacity/100 )
			.on("mouseenter", this.tooltipEnter.bind(tt))
			.on("mouseleave", this.tooltipLeave.bind(tt))
			.call(d3.drag()
				.on("start", this.dragstarted.bind(this))
				.on("drag", this.dragged.bind(this))
				.on("end", this.dragended.bind(this)));
			
		if (box.texts) {
			if (this.transform.k>this.common.limitGraphDetail) {
				this.svg.append("g")
					.selectAll("text")
					.data(box.texts)
					.enter().append("text")
					.attr("class", "grapher-textbox")
					.attr("transform", this.transform.toString())
					.attr("x", function(d) { return d.box.x+d.x })
					.attr("y", function(d) { return d.box.y+d.y })
					//.attr("font-family", "sans-serif")
					//.attr("font-family", "Monospaced")
					//.attr("font-style", "plain")
					//.attr('font-size', 9)
					.attr("text-anchor", "middle")
					.attr("text-align", "center")
					.style("pointer-events", "none")
					.text(function(d) { return d.text; })
					.on("mouseenter", this.tooltipEnter.bind(tt))
					.on("mouseleave", this.tooltipLeave.bind(tt))
			}
		}
	}

	displayParentLabel(app) {
		let tt = this
		let title = ""
		this.graphTitle.forEach(function(name) {
			title+=" / "+name
		})
 
		this.svg.append("g")
			.append("text")
			.attr("class", "grapher-title")
			.attr("x", 25)
			.attr("y", 15) 
			.attr("text-anchor", "start")
			.text(title)

		this.svg.append("g")
			.append("image")
			.attr("x", 1)
			.attr("y", 1)
			//.attr("xlink:href", "icons/grapher/initialization.png")
			.attr("xlink:href", tt.iconsPath+"exit.png")
			.attr("width", "20px")
			.attr("height","20px")		
			.on("mouseup", function(d) { tt.common.loadParent(tt, tt.graphParent)})
	}

	displayLinks(computeLinks) {
		let tt = this
		this.svg.append("g")
			.selectAll(".link")
			.data(tt.data.links)
			.enter().append("path")
			.attr("class", "grapher-link")
			.attr("transform", tt.transform.toString())
			.attr("d", function(d) {
				if (!computeLinks && d.path) {
					return d.path;
				}
				d.path = tt.common.computeLink(d)
				return d.path;
			})
			.attr("stroke", function(b) { return tt.common.getLinkColor(b); })
			//.style("stroke", function(b) { return tt.getLinkColor(b); })
			.style("fill", "none")
			.style("stroke-width", function(b) { return tt.getLinkStrokeWidth(b); })
			.style("stroke-dasharray", tt.common.getLinkDash)
			//.attr("marker-end", "url(#arrow)")
			//.attr("marker-end", function(b) { if (tt.common.gstyle==0) return tt.marker0(tt.common.getLinkColor(b)); else return tt.marker1("#arrow");})
			.attr("marker-end", function(b) { return tt.marker1("#arrow");})
			.on("mousedown", tt.selectLink.bind(tt))
			//.on("dblclick", this.dblclick.bind(this))

		if (this.transform.k>this.common.limitGraphDetail) {
			if (this.linkIcon>0) {
				this.svg.append("g")
					.selectAll("circle")
					.data(tt.data.links)
					.enter()
					.append("circle")
						.attr("transform", this.transform.toString())
						.attr("r", function(d) { tt.computeIconPlace(d); if (tt.linkIcon==1) return 5; else return 8; })
						.attr("cx", function (d) { return d.iconx })
						.attr("cy", function (d) { return d.icony })
						.attr("stroke", function(b) { return tt.common.getLinkColor(b); })
						.attr("fill", function(b) { 
							if (tt.linkIcon==2) {
								return tt.common.spaceBackground
							} else {
								return tt.common.getLinkColor(b); 
							}
						})
						.on("mousedown", tt.selectLink.bind(tt))
			}
		
			if (tt.linkIcon == 2) {
				this.svg.append("g")
					.attr("class", "grapher-link")
					.selectAll("image")
					.data(tt.data.links)
					.enter()
					.append("image")
					.attr("transform", tt.transform.toString())
					.attr("x", function(d) { return d.iconx -8 })
					.attr("y", function(d) { return d.icony -8 })
					.attr("xlink:href", function(d) { return tt.getIconLink(d) } )
					.attr("width", "16px")
					.attr("height","16px")
					.on("mousedown", tt.selectLink.bind(tt))
			}
		}			
	}

	computeIconPlace(link) {
		if (link.dtype == 0 || link.dtype == 1) {
			link.iconx = (link.lpath[2]+link.lpath[4])/2
			link.icony = (link.lpath[3]+link.lpath[5])/2
		} else if (link.dtype == 2 || link.dtype == 3) {
			link.iconx = link.lpath[2]
			link.icony = link.lpath[3]
		} else if (link.dtype == 4 || link.dtype == 6 || link.dtype == 7) {
			link.iconx = (link.lpath[0]+link.lpath[2])/2
			link.icony = (link.lpath[1]+link.lpath[3])/2
		}
	}

	displayHandlers() {
		this.svg.append("g")
			.selectAll("rect")
			.data(this.boxHandlers)
			.enter().append("rect")
				.attr("transform", this.transform.toString())
				.attr("x", function(d) { return d.x-5; })
				.attr("y", function(d) { return d.y-5; })
				.attr("width", function(d) { return d.w; })
				.attr("height", function(d) { return d.h; })
				.style("fill", 'black')
				.call(d3.drag()
					.on("start", this.dragstartedBox.bind(this))
					.on("drag", this.draggedBox.bind(this))
					.on("end", this.dragendedBox.bind(this)));
	}

	displayGrid() {
		if (this.gridStep*this.transform.k<=8) {
			return;
		}
		if (!this.dataGrid) {
			this.dataGrid=[]
			let xmin = Math.floor(this.transform.invertX(0))
			let ymin = Math.floor(this.transform.invertY(0))
			let xmax = Math.floor(this.transform.invertX(this.width))
			let ymax = Math.floor(this.transform.invertY(this.height))
			xmin=xmin-(xmin%this.gridStep);
			xmax=xmax-(xmax%this.gridStep);
			ymin=ymin-(ymin%this.gridStep);
			ymax=ymax-(ymax%this.gridStep);
			//console.log(xmin+","+ymin+" - "+xmax+","+ymax)
			for (let x=xmin-this.gridStep; x<xmax+this.gridStep; x=x+this.gridStep) {
				for (let y=ymin-this.gridStep; y<ymax+this.gridStep; y=y+this.gridStep) {
					this.dataGrid.push({ x: x, y: y });
				}
			}
		}
		//console.log(this.dataGrid.length)
		this.svg.append("g")
			.selectAll(".grid")
			.data(this.dataGrid)
			.enter().append("path")
			.attr( "class", "grapher-grid" )
			.attr("transform", this.transform.toString())
			.attr("d", function(d) {
				return "M"+(d.x)+" "+d.y+" L"+(d.x+1)+" "+d.y;
			})
			.style("stroke", "grey")
			.style("fill", "none")
			.style("stroke-width", 1)
	}

	customText(d) {
		return d.id
	}

	clip() {
		let startTime = new Date().getTime();
		let k= this.transform.k
		//console.log(k)
		let data = { nodes: [], links: [], boxes: [], texts: [] }
		if (k<this.common.limitAll) {
			return;
		}
		//console.log(this.transform.k)
		let xmin = Math.floor(this.transform.invertX(-50));
		let xmax = Math.floor(this.transform.invertX(this.width+50));
		let ymin = Math.floor(this.transform.invertY(-50));
		let ymax = Math.floor(this.transform.invertY(this.height+50));
		//console.log("x:("+xmin+","+xmax+") - y:("+ymin+","+ymax+")")
		let tt = this;
		if (k>this.common.limitAll) {
			for (let i=0; i<this.common.fullData.nodes.length;i++) {
				let ele = this.common.fullData.nodes[i];
				if (ele.x+ele.w>xmin && ele.x<xmax && ele.y+ele.h>ymin && ele.y<ymax) {
					data.nodes.push(ele);
				}
			}
			for (let i=0; i<this.common.fullData.boxes.length;i++) {
				let ele = this.common.fullData.boxes[i];
				if (ele.x+ele.w>xmin && ele.x<xmax && ele.y+ele.h>ymin && ele.y<ymax) {
					data.boxes.push(ele);
					ele.texts.forEach(function(text) {
						data.texts.push(text)
					})
				}
			}
			if (k>this.common.limitGraph) {
				for (let i=0; i<this.common.fullData.links.length;i++) {
					let link = this.common.fullData.links[i];
					if (link.boxed.xmax < xmin || link.boxed.xmin > xmax || link.boxed.ymax < ymin || link.boxed.ymin > ymax) {
						//out
					} else {
						data.links.push(link);
					}
					/*
					let n1 = tt.common.allNodes[link.source];
					let n2 = tt.common.allNodes[link.target];
					if (n1 !== undefined && n2 !== undefined) {
						if (n1.x+n1.w>xmin && n1.x<xmax && n1.y+n1.h>ymin && n1.y<ymax) {
							//data.links = data.links.concat(link)
							data.links.push(link);
						} else if (n2.x+n2.w>xmin && n2.x<xmax && n2.y+n2.h>ymin && n2.y<ymax) {
							data.links.push(link);
						}
					}
					*/
				}
			}
		}
		/*
		if (k>this.common.limitGraph) {
			data.nodes.forEach(this.common.linkInit.bind(this.common))
		}
		*/
		//console.log("clip time: "+(new Date().getTime() - startTime));
		//console.log(data.nodes.length)
		this.data = data;
	}


	selectLink(l) {
		this.debugLink = l
		this.selectedLink = l;
		this.selectedLinkTime = Date.now()
		if (this.onDblclick(l)) {
			return
		}
		this.redisplay()
		this.onSelect() 
	}

	getLinkStrokeWidth(l) {
		if (this.selectedLink !== undefined && this.selectedLink.id == l.id) {
			return 5;
		} 
		return 3;
	}

	dragstarted(d) {
		this.moved = false
		if (this.handling) {
			return
		}
		if (this.onDblclick(d)) {
			return
		}
		if (this.mode=="info") {
			this.x0 = this.transform.invertX(d3.event.sourceEvent.clientX)
			this.y0 = this.transform.invertY(d3.event.sourceEvent.clientY)
			this.selectGraph(d);
			let tt=this;
			Object.keys(this.selectedGraphs).forEach(
				function(id) {
					let node = tt.selectedGraphs[id];
					if (node) {
						node.x0 = node.x
						node.y0 = node.y
					}
				}
			)
			if (this.boxHandlers) {
				this.boxHandlers.forEach(
					function(b) {
						b.x0 = b.x
						b.y0 = b.y
					}	
				)
			}
		}
	}

	dragged(d) {
		if (!this.common.allowMove) {
			return
		}
		if (this.handling) {
			return
		}
		d.moved = true
		if (this.mode == "info") {
			this.dx =  this.transform.invertX(d3.event.sourceEvent.clientX)-this.x0;
			this.dy =  this.transform.invertY(d3.event.sourceEvent.clientY)-this.y0;

			this.moveSelection(this.dx, this.dy, false)
		} 
	}

	dragended(d) {
		d.moved = false
		if (this.mode=='addLink' && d.gtype=='node') {
		 	if (this.selectedGraphs!==undefined) {
		 		let list = Object.keys(this.selectedGraphs)
		 		if (list.length==1) {
			 		let fromId = list[0]
					this.addLink(fromId, d.id, this.addModeData['callback'])
					this.redisplay()
					this.mode = "info"
					console.log("set mode: info")
				} else {
					this.mode = "info-beforeLink"	
				}
			} else {
				this.mode = "info-beforeLink"
			}
		}
		if (this.mode=="info") {
			if (this.moved) {
				this.newUndoSession()
				let tt=this
				Object.keys(this.selectedGraphs).forEach(
					function(id) {
						let node = tt.selectedGraphs[id];
						if (node) {
							tt.pushToUndo('move', {id: id, x: node.x0, y: node.y0, newX: node.x0+tt.dx, newY: node.y0+tt.dy }, false)
						}
					}
				)
				this.redisplay(true)
			}
		} else if (this.mode=="info-beforeLink") {
			this.selectGraph(d);
			this.mode="addLink"
		} else if (this.mode == "moveUp") {
			this.moveUp(d)
		} else if (this.mode == "moveBottom") {
			this.moveBottom(d)
		}
	}

	moveSelection(dx, dy, relative) {
		if (!this.common.allowMove) {
			return
		}
		let tt=this;
		if (relative) {
			this.newUndoSession()
		}
		Object.keys(this.selectedGraphs).forEach(
			function(id) {
				let node = tt.selectedGraphs[id];
				if (node) {
					let xx
					let yy
					if (relative) {
						xx= node.x + dx
						yy= node.y + dy
					} else {
						xx = node.x0 + dx;
						yy = node.y0 + dy;
					}
					if (Object.keys(tt.selectedGraphs).length==1){
						if (tt.grid) {
							xx=Math.floor(xx);
							yy=Math.floor(yy);
							xx = xx-(xx%tt.gridStep);
							yy = yy-(yy%tt.gridStep);
							if (tt.boxHandlers) {
								tt.boxHandlers[0].x = xx
								tt.boxHandlers[0].y = yy
								tt.boxHandlers[1].x = xx+node.w
								tt.boxHandlers[1].y = yy
								tt.boxHandlers[2].x = xx+node.w
								tt.boxHandlers[2].y = yy+node.h
								tt.boxHandlers[3].x = xx
								tt.boxHandlers[3].y = yy+node.h
							}
						} else {
							if (tt.boxHandlers) {
								tt.boxHandlers.forEach(
									function(b) {
										if (relative) {
											b.x = b.x + dx;
											b.y = b.y + dy;
										} else {
											b.x = b.x0 + dx;
											b.y = b.y0 + dy;
										}
									}	
								)
							}
						}
					} else {
						if (tt.grid) {
							xx=Math.floor(xx);
							yy=Math.floor(yy);
							xx = xx - (xx%tt.gridStep);
							yy = yy - (yy%tt.gridStep);
						}
					}
					if (relative) {
						tt.pushToUndo('move', {id: id, x: node.x, y: node.y, newX: xx, newY: yy}, false)
					}
					node.x = xx;
					node.y = yy;
				}
			}
		)
		this.updated = true
		this.moved = true
		//this.debugPrint()
		this.redisplay(true, true);
	}

	debugPrint() {
		let l = this.debugLink
		if (l === undefined) {
			return
		}
		let source = this.common.allNodes[l.source]
		let target = this.common.allNodes[l.target]
		if (this.common.isUp(source, source.x, source.y, target.x, target.y)) {
			console.log("up")
		}
		if (this.common.isBottom(source, source.x, source.y, target.x, target.y)) {
			console.log("bottom")
		}
		if (this.common.isLeft(source, source.x, source.y, target.x, target.y)) {
			console.log("left")
		}
		if (this.common.isRight(source, source.x, source.y, target.x, target.y)) {
			console.log("right")
		}
		if (this.common.isUpLeft(source.x, source.y, target.x, target.y)) {
			console.log("UpLeft")
		}
		if (this.common.isBottomLeft(source.x, source.y, target.x, target.y)) {
			console.log("BottomLeft")
		}
		if (this.common.isUpRight(source.x, source.y, target.x, target.y)) {
			console.log("UpRight")
		}
		if (this.common.isBottomRight(source.x, source.y, target.x, target.y)) {
			console.log("Bottomright")
		}
	}

	dragstartedBox(d) {
		this.handling=true
		this.x0 = this.transform.invertX(d3.event.sourceEvent.clientX)
		this.y0 = this.transform.invertY(d3.event.sourceEvent.clientY)
		d.x0 = d.x
		d.y0 = d.y
		let box = this.common.allNodes[d.id]
		if (box !== undefined) {
			box.savedCoord = {x: box.x, y: box.y, w: box.w, h: box.h}
		}
		this.moved = false
	}

	draggedBox(d) {
		if (!this.common.allowMove) {
			return
		}
		if (this.mode == "info") {
			let dx =  this.transform.invertX(d3.event.sourceEvent.clientX)-this.x0;
			let dy =  this.transform.invertY(d3.event.sourceEvent.clientY)-this.y0;

			let xx = d.x0 + dx;
			let yy = d.y0 + dy;
			if (this.grid) {
				xx=Math.floor(xx);
				yy=Math.floor(yy);
				xx = xx-(xx%this.gridStep);
				yy = yy-(yy%this.gridStep);
			}
			d.x = xx;
			d.y = yy;
			this.computeBoxHandlers(d)
			this.updated = true
			this.moved = true
			this.redisplay(true, true);
		}
	}

	dragendedBox(d) {
		//this.computeBoxHandlers(d)
		if (this.moved) {
			if (this.mode == "info") {
				let box = this.common.allNodes[d.id]
				if (box !== undefined) {
					let newBox = {x: box.x, y: box.y, w: box.w, h: box.h}
					this.pushToUndo('resize', { id: d.id, box: box.savedCoord, newBox: newBox }, true)
				}
				this.redisplay()
				this.handling=false
			}
		}
	}

	computeBoxHandlers(d) {
		let text = this.selectedBox
		if (d.pos == 0) {
			if (d.x < this.boxHandlers[2].x && d.y < this.boxHandlers[2].y) {
				text.x = d.x
				text.y = d.y
				text.w = this.boxHandlers[2].x - d.x
				text.h = this.boxHandlers[2].y - d.y
			}
		} else if (d.pos == 1) {
			if (d.x > this.boxHandlers[0].x && d.y < this.boxHandlers[2].y) {
				text.y = d.y
				text.w = d.x - this.boxHandlers[0].x
				text.h = this.boxHandlers[2].y - d.y
			}
		} else if (d.pos == 2) {
			if (d.x > this.boxHandlers[0].x && d.y > this.boxHandlers[0].y) {
				text.w = d.x - this.boxHandlers[0].x
				text.h = d.y - this.boxHandlers[0].y
			}
		} else if (d.pos == 3) {
			if (d.x < this.boxHandlers[2].x && d.y > this.boxHandlers[0].y) {
				text.x = d.x 
				text.w = this.boxHandlers[2].x - d.x
				text.h = d.y - this.boxHandlers[0].y
			}
		}

		this.boxHandlers[0].x = text.x
		this.boxHandlers[0].y = text.y
		this.boxHandlers[1].x = text.x+text.w
		this.boxHandlers[1].y = text.y
		this.boxHandlers[2].x = text.x+text.w
		this.boxHandlers[2].y = text.y+text.h
		this.boxHandlers[3].x = text.x
		this.boxHandlers[3].y = text.y+text.h

		let yy=(text.h-text.texts.length*12)/2+8;
		text.texts.forEach(
			function(b) {
				b.x = text.w/2
				b.y = yy
				yy = yy + 12
			}	
		)

		this.redisplay()
	}

	zoomed() {
		if (this.mousex === undefined || this.mousey === undefined) {
			return
		}
		this.dataGrid=undefined;
		this.trxx = this.transform.invertX(this.mousex);
		this.tryy = this.transform.invertY(this.mousey);
		let k = 0
		if (d3.event.deltaY<0) {
			if (this.transform.k>2) {
				return;
			}
			k = this.transform.k * 1.2;
		} else {
			k = this.transform.k / 1.2;
		}
		if (k>3) {
			return
		}
		this.transform.k = k
		this.transform.x = this.mousex-this.trxx * this.transform.k;
		this.transform.y = this.mousey-this.tryy * this.transform.k;
		this.redisplay();
		if (this.graphTotal !== undefined) {
			this.computeTotalRect(this.graphTotal);
			this.graphTotal.redisplayBox();
		}
	}

	zoomOn(x, y, doNotCenter) {
		let xn = this.transform.applyX(x)
		let yn = this.transform.applyY(y)
		if (doNotCenter && xn>2 && xn<this.width-this.common.jobW/2 && yn>2 && yn<this.height-this.common.jobH/2) {
			this.redisplay();	
			return
		}
		this.transform.x = this.width/2 - x*this.transform.k
		this.transform.y = this.height/2 - y*this.transform.k	
		this.redisplay();
		if (this.graphTotal !== undefined) {
			this.computeTotalRect(this.graphTotal);
			this.graphTotal.redisplayBox();
		}	
	}


	setMouse() {
		let tt=this;
		d3.select("svg.agrapher")
			.on("mousedown", this.mouseDown.bind(this))
			.on("mousemove", this.mouseMove.bind(this))
			.on("mouseup", this.mouseUp.bind(this))
	}

	mouseDown() {
		this.selectedAreaStarted=false
		this.selectedBoxStarted=false
		this.zoomByWindowStarted=false
		this.panStarted = false;
		this.mouseMoved=false;
		this.mouseInitX = d3.event.offsetX;
		this.mouseInitY = d3.event.offsetY;
		this.dx = d3.event.offsetX - d3.event.pageX
		this.dy = d3.event.offsetY - d3.event.pageY

		this.selectedBoxStarted=false
		if (this.isDblclick()) {
			this.selectedBoxStarted=true
		}

		if (this.mode=="info") {
			if (this.selectedBoxStarted && this.common.allowMultiSelection) {
				this.selectedGraphs={};
				this.aX1 = 0;
				this.aY1 = 0;
				this.aX2 = 0;
				this.aY2 = 0;
				this.selectedBoxStarted=true
				this.areaX1=this.transform.invertX(d3.event.offsetX);
				this.areaY1=this.transform.invertY(d3.event.offsetY);
			} else if (d3.event.ctrlKey && this.common.allowMultiSelection) {
				this.aX1=this.transform.invertX(d3.event.offsetX);
				this.aY1=this.transform.invertY(d3.event.offsetY);
				this.aX2 = this.aX1
				this.aY2 = this.aY1
				this.selectArea = [[this.aX1, this.aY1]]
				this.selectedAreaStarted=true
			} else {
				this.trx = this.transform.x
				this.try = this.transform.y
				this.panx = d3.event.offsetX;
				this.pany = d3.event.offsetY;
				this.panStarted = true;
				this.selectedAreaStarted=false;
			}
			return;
		} else if (this.mode=="addText") {
			this.aX1 = 0;
			this.aY1 = 0;
			this.aX2 = 0;
			this.aY2 = 0;
			this.areaX1=this.transform.invertX(d3.event.offsetX);
			this.areaY1=this.transform.invertY(d3.event.offsetY);
			this.selectedBoxStarted = true
		} else if (this.mode == "zoomByWindow") {
			this.aX1 = 0;
			this.aY1 = 0;
			this.aX2 = 0;
			this.aY2 = 0;
			this.zoomByWindowStarted=true
			this.areaX1=this.transform.invertX(d3.event.offsetX);
			this.areaY1=this.transform.invertY(d3.event.offsetY);
		}
	}

	mouseMove() {
		if (this.mode != "info" && this.mode!="addText" && this.mode !="zoomByWindow") {
			return;
		}
		this.mouseMoved=true;
		if (this.dx===undefined || this.dy===undefined) {
			this.dx = d3.event.offsetX - d3.event.pageX
			this.dy = d3.event.offsetY - d3.event.pageY
		}
		this.mousex = d3.event.pageX + this.dx;
		this.mousey = d3.event.pageY + this.dy;
		if (this.panStarted) {
			this.transform.x = this.trx + (this.mousex - this.mouseInitX);
			this.transform.y = this.try + (this.mousey - this.mouseInitY);
			this.redisplay()
			return;
		} else if (this.selectedBoxStarted || this.zoomByWindowStarted) {
			this.areaX2=this.transform.invertX(this.mousex);
			this.areaY2=this.transform.invertY(this.mousey);
			this.computeSelectedRect(this.areaX1, this.areaY1, this.areaX2, this.areaY2);
			d3.selectAll("#selectBox").remove();
			this.svg.append("rect")
				.attr("id", "selectBox")
				.attr("transform", "translate(" + this.transform.x + "," + this.transform.y + ") scale(" + this.transform.k + ")")
				.attr("x", this.aX1)
				.attr("y", this.aY1)
				.attr("width", this.aX2-this.aX1)
				.attr("height", this.aY2-this.aY1)
				.attr("stroke", "black")
				.attr("stroke-dasharray", "3, 3")
				.attr("stroke-width", 1/this.scale)
				.attr("fill", "none")
			return;
		} else if (this.selectedAreaStarted) {
			let x = this.transform.invertX(this.mousex)
			let y = this.transform.invertY(this.mousey)
			let pt = this.selectArea[this.selectArea.length-1];
			let dd = (pt[0] -x)*(pt[0]-x)+(pt[1]-y)*(pt[1]-y)
			if ((pt[0] -x)*(pt[0]-x)+(pt[1]-y)*(pt[1]-y) < this.selectAreaMinDist) {
				return;
			}
			if (x < this.aX1) {
				this.aX1 = x
			}
			if (x > this.aX2) {
				this.aX2 = x
			}
			if (y < this.aY1) {
				this.aY1 = y
			}
			if (y > this.aY2) {
				this.aY2 = y
			}
			this.selectArea.push([x, y]);
			d3.selectAll("#selectArea").remove();
			let path = this.getAreaPath();
			this.svg.append("path")
				.attr("id", "selectArea")
				.attr("transform", "translate(" + this.transform.x + "," + this.transform.y + ") scale(" + this.transform.k + ")")
				.attr("d", path)
				.attr("stroke", "black")
				.attr("stroke-dasharray", "3, 3")
				.attr("stroke-width", 1/this.scale)
				.attr("fill", "none")
		}
	}

	zoomOnArea() {
		let ww = (this.areaX2 - this.areaX1);
		let hh = (this.areaY2 - this.areaY1);

		if (ww<10 || hh<10) {
			return
		}
		let xm = (this.areaX2 + this.areaX1)/2;
		let ym = (this.areaY2 + this.areaY1)/2;

		let coef1 = this.width/ww
		let coef2 = this.width/hh
		let coef3 = this.height/ww //graph2
		let coef4 = this.height/hh //graph1
		let scale = Math.min(coef1, coef2, coef3, coef4)
		
		if (scale > 3) {
			scale = 3
		}
		this.transform.k = scale //scale/1.2;
		this.transform.x = this.width/2 - xm * this.transform.k;
		this.transform.y = this.height/2 - ym * this.transform.k;
		this.redisplay();
		if (this.graphTotal !== undefined) {
			this.computeTotalRect(this.graphTotal);
			this.graphTotal.redisplayBox();	
		}	
	}

	mouseUp() {
		if (this.mode == "info") {
			if (!this.mouseMoved) {
				this.selectedGraphs = {}
				this.boxHandlers = undefined
				if (this.selectedLinkTime !== undefined && (Date.now() - this.selectedLinkTime) > 500) {
					this.selectedLink = undefined
				}
				this.redisplay();
			}
			if (this.panStarted) {
				this.dataGrid=undefined;
				if (this.graphTotal !== undefined) {
					this.computeTotalRect(this.graphTotal);
					this.graphTotal.redisplayBox();
				}
				this.panStarted = false;
				return;
			} else if (this.selectedBoxStarted) {
				this.selectedBoxStarted = false;
				this.selectGraphsByBox();
				this.redisplay();
			} else if (this.selectedAreaStarted) {
				this.selectedAreaStarted = false;
				this.selectArea.push(this.selectArea[0]);
				this.selectGraphsByArea();
				this.selectArea=undefined
				this.redisplay();
			} 
		} else if (this.mode == "addNode") {
			this.addNode(this.addModeData['type'], d3.event.offsetX, d3.event.offsetY, this.addModeData['ctype'], this.addModeData['callback'])
			this.mode = "info"
			console.log("set mode: info")
			this.redisplay()
		} else if (this.mode == "addText") {
			this.selectedBoxStarted = false;
			if (!this.mouseMoved || Math.abs(this.aX1-this.ax2)<20 || Math.abs(this.aY1 -this.aY2)<10) {
				let x = this.transform.invertX(this.mousex)
				let y = this.transform.invertY(this.mousey)
				this.aX1 = x - 50
				this.aY1 = y - 25
				this.aX2 = x + 50
				this.aY2 = y + 25
			}
			this.addText(this.aX1, this.aY1, this.aX2-this.aX1, this.aY2-this.aY1, this.addModeData['texts'], this.addModeData['callback'])
			this.mode = "info"
			console.log("set mode: info")
			this.redisplay()
		} else if (this.mode == "zoomByWindow") {
			this.zoomByWindowStarted = false
			this.zoomOnArea()
			this.mode = "info"
			console.log("set mode: info")
		}
	}

	computeSelectedRect(x1, y1, x2, y2) {
		this.aX1 = x1;
		this.aX2 = x2;
		if (x2<x1) {
			this.aX1 = x2;
			this.aX2 = x1;
		}
		this.aY1 = y1;
		this.aY2 = y2;
		if (y2<y1) {
			this.aY1 = y2;
			this.aY2 = y1;
		}
	}

	getAreaPath() {
		if (!this.selectArea) {
			return "";
		}
		let pt=this.selectArea[0]
		let path = "M "+this.selectArea[0][0]+" "+this.selectArea[0][1];
		for (let ii=1; ii<this.selectArea.length; ii++) {
			pt=this.selectArea[ii];
			path+= (" L "+pt[0]+" "+pt[1]);

		}
		if ( this.selectArea.length>10 && (pt[0]-this.selectArea[0][0])*(pt[0]-this.selectArea[0][0]) + (pt[1]-this.selectArea[0][1]) * (pt[1]-this.selectArea[0][1]) < 80*80) {
			path+= (" L "+this.selectArea[0][0]+" "+this.selectArea[0][1]);
		}
		return path;
	}

	formatDate(d) {
		return ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +
    		d.getFullYear() + " at " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);

	}

	//keyboard
	setKeyboard() {
		let tt=this;
		d3.select("body").on("keyup", function(d) {
			//console.log(d3.event.key)
			if (d3.event.key == ' ') {
				let nn
				if (tt.debugLink!==undefined) {
					if (tt.linkWhere) {
						tt.linkWhere = false
						nn = tt.debugLink.source
					} else {
						tt.linkWhere = true
						nn = tt.debugLink.target
					}
					let node = tt.common.allNodes[nn]
					tt.selectedLink = undefined
					tt.selectedGraphs = {}
					tt.selectedGraphs[nn] = node
					tt.zoomOn(node.x, node.y, true)
				}
			}
			if (d3.event.key == 'w') {
				let list = Object.keys(tt.selectedGraphs)
				if (list.length > 0) {
					if (tt.moveN === undefined) {
						tt.moveN = 0
					} else {
						tt.moveN++
					}
					let list = Object.keys(tt.selectedGraphs)
					if (tt.moveN >= list.length) {
						tt.moveN = 0
					}
					console.log(tt.moveN)
					let nn = list[tt.moveN]
					if (nn) {
						tt.moveOnNode(nn)
					}
				}
			}
			if (d3.event.key == 'v') {
				tt.setSelectedNodeByFunction(function(node) {
					if (node.text.indexOf("_SIT_")>=0) {
						return true
					}
					return false
				})
			}
			if (d3.event.key === "Escape") {
				tt.setModeInfo()
				console.log(tt)
				tt.common.loadParent(tt)
			}
			if (d3.event.key=='s') {
				tt.common.saveGraph("current", function(status, ret) {
					console.log(ret);
				})
			}
			if (d3.event.key==='p') {
				tt.linkIcon++
				if (tt.linkIcon>2) {
					tt.linkIcon = 0
				}
				tt.redisplay(true)
			}
			if (d3.event.key==='g') {
				tt.setGrid(!tt.isGrid())
			}
			if (d3.event.key==='i') {
				tt.viewId = !tt.viewId;
				tt.redisplay()
			}
			if (d3.event.key == '?') {
				//tt.common.cconvertOldGraphtoNew()
			} 
			if (d3.event.key==='t') {
				tt.doZoomTotal()
			}
			if (d3.event.key==='l') {
				let id="L"+tt.common.index
				tt.common.index++;
				tt.setModeAddLink(function(id) {
					console.log("created link: "+id)
				})
			}
			if (d3.event.key==='b') {
				let id="B"+tt.common.index
				tt.common.index++;
				tt.setModeAddText(function(id) {
					console.log("created textBox: "+id)
				})
			}
			if (d3.event.key==='n') {
				tt.setModeAddNode("1", "0", function(id) {
					console.log("created node: "+id)
				})
			}
			if (d3.event.key==='a') {
				tt.setModeAddNode("0", "0", function(id) {
					console.log("created app: "+id)
				})
			}
			if (d3.event.key==='Delete') {
				if (tt.common.allowDelete) { 
					if (tt.selectedLink !== undefined) {
						tt.deleteSelectedLink()
					} else {
						tt.deleteSelectedNodes()		
					}
				}
			}
			if (d3.event.key==='1') {

			}
			if (d3.event.key==='2') {

			}
			if (d3.event.key==='q') {
				if (this.qmode === undefined || this.qmode == 0) {
					let now = new Date()
					tt.common.fullData.nodes.forEach(function(node) {
						node.status = Math.floor(Math.random() * 5) +1;
						node.date = tt.formatDate(now);
						node.statusText = tt.common.statusText[node.status]
						if (Math.floor(Math.random() * 20) == 0) {
							node.isCyclic = true
						}
					})
					this.qmode = 1
				} else {
					tt.common.fullData.nodes.forEach(function(node) {
						node.status = 0
						node.isCyclic = false
					})
					this.qmode = 0
				}
				tt.redisplay()
			}
			if (d3.event.key=='z') {
				tt.setModeZoomByWindows()
			}
			if (d3.event.key=='u' || (d3.event.ctrlKey && d3.event.key=='z')) {
				tt.undoLast()
			}
			if (d3.event.key=='r' || (d3.event.ctrlKey && d3.event.key=='y')) {
				tt.redoLast()
			}
			if (d3.event.key=='a' && d3.event.ctrlKey) {
				tt.selectedGraphs = {}
				tt.common.fullData.nodes.forEach(function(nn){
					tt.selectedGraphs[nn.id] = nn
				})
				tt.common.fullData.boxes.forEach(function(nn){
					tt.selectedGraphs[nn.id] = nn
				})
				tt.redisplay()
			}
			if (d3.event.key==='PageUp') {	
				tt.doZoom(1.2)	
			}
			if (d3.event.key==='PageDown') {
				tt.doZoom(0.8333)			
			}
			if (d3.event.key==='ArrowLeft') {
				if (tt.selectedLink!==undefined) {
					tt.updateLinkDepth(-5)
				} else if (Object.keys(tt.selectedGraphs).length > 0) {
					tt.moveSelection(-tt.gridStep, 0, true)
				} else {
					tt.doPan(100, 0);
				}
			}
			if (d3.event.key==='ArrowRight') {
				if (d3.event.shiftKey) {
					tt.reorganize('h')
					tt.redisplay(true)
				} else if (tt.selectedLink!==undefined) {
					tt.updateLinkDepth(5)
				}  else if (Object.keys(tt.selectedGraphs).length > 0) {
					tt.moveSelection(tt.gridStep, 0, true)
				} else {
					tt.doPan(-100, 0);
				}
			}
			if (d3.event.key==='ArrowUp') {
				if (tt.selectedLink!==undefined) {
					tt.updateLink(1)
				}  else if (Object.keys(tt.selectedGraphs).length > 0) {
					tt.moveSelection(0, -tt.gridStep, true)
				} else {
					tt.doPan(0, 100);
				}
			}
			if (d3.event.key==='ArrowDown') {
				if (d3.event.shiftKey) {
					tt.reorganize('v')
					tt.redisplay(true)
				} else if (tt.selectedLink!==undefined) {
					tt.updateLink(-1)
				}  else if (Object.keys(tt.selectedGraphs).length > 0) {
					tt.moveSelection(0, tt.gridStep, true)
				} else {
					tt.doPan(0, -100);
				}
			}
		})
	}

	computeTotalRect(graphThis) {
		graphThis.xr = this.transform.invertX(0);
		graphThis.yr = this.transform.invertY(0);
		graphThis.wr = this.transform.invertX(this.width)-this.transform.invertX(0);
		graphThis.hr = this.transform.invertY(this.height)-this.transform.invertY(0);
	}

	selectGraphsByBox() {
		this.selectedGraphs={};
		this.selectedLink = undefined
		let tt = this;
		//console.log("sel:"+this.aX1+","+this.aY1+","+this.aX2+","+this.aY2)
		this.common.fullData.nodes.forEach(
			function(node) {
				//console.log(node.x+","+node.y+","+(node.x+node.w)+","+(node.y+node.h))
				if (node.x > tt.aX1 && node.x+node.w < tt.aX2 && node.y > tt.aY1 && node.y+node.h < tt.aY2) {
					tt.selectedGraphs[node.id]=node;
				}
			}
		)
		this.common.fullData.boxes.forEach(
			function(box) {
				if (box.x > tt.aX1 && box.x+box.w< tt.aX2 && box.y > tt.aY1 && box.y+box.h < tt.aY2) {
					tt.selectedGraphs[box.id]=box;
				}
			}
		)
		this.selectUniqueText()		
		this.redisplay()
		this.onSelect()
	}

	selectUniqueText() {
		this.boxHandlers = undefined
		if (Object.keys(this.selectedGraphs).length == 1) {
			let id =  Object.keys(this.selectedGraphs)[0];
			let node = this.selectedGraphs[id]
			if (node.gtype == "box") {
				this.selectedBox = node
				this.boxHandlers = [
					{ id: id, pos: 0, x: node.x,        y: node.y, 			w:10, h:10},
					{ id: id, pos: 1, x: node.x+node.w, y: node.y, 			w:10, h:10},
					{ id: id, pos: 2, x: node.x+node.w, y: node.y+node.h, 	w:10, h:10},
					{ id: id, pos: 3, x: node.x,        y: node.y+node.h, 	w:10, h:10}
				]
			}
		}
	}

	selectGraphsByArea() {
		this.selectedGraphs={};
		this.selectedLink = undefined
		let tt = this;
		let jw = this.common.jobW;
		let jh = this.common.jobW;
		let area = tt.selectArea
		this.common.fullData.nodes.forEach(
			function(node) {
				if (node.x >= tt.aX1 && node.x+node.w <= tt.aX2 && node.y >= tt.aY1 && node.y+node.h <= tt.aY2) {
					if (tt.common.isNodeInArea(area, node.x, node.y) && tt.common.isNodeInArea(area, node.x+node.w, node.y) && tt.common.isNodeInArea(area, node.x, node.y+node.h) && tt.common.isNodeInArea(area, node.x+node.w, node.y+node.h)) {
						tt.selectedGraphs[node.id]=node;
					} else {
					}
				}
			}
		)
		this.common.fullData.boxes.forEach(
			function(box) {
				if (box.x > tt.aX1 && box.x+box.w< tt.aX2 && box.y > tt.aY1 && box.y+box.h < tt.aY2) {
					if (tt.common.isNodeInArea(area, box.x, box.y) && tt.common.isNodeInArea(area, box.x+box.w, box.y) && tt.common.isNodeInArea(area, box.x, box.y+box.h) && tt.common.isNodeInArea(area, box.x+box.w, box.y+box.h)) {
						tt.selectedGraphs[box.id]=box;
					} else {
					}
				}
			}
		)
		this.redisplay()
		this.onSelect()
	}

	selectGraph(d) {
		this.selectedLink = undefined
		if (d3.event.sourceEvent) {
			if (!d3.event.sourceEvent.ctrlKey) {
				if (!this.selectedGraphs[d.id]) {
					this.selectedGraphs={};
					this.selectedGraphs[d.id]=d;
				}
			} else if (this.common.allowMultiSelection) {
				if (this.selectedGraphs[d.id]) {
					delete this.selectedGraphs[d.id]
				} else {
					this.selectedGraphs[d.id] = d
				}
			}
			this.selectUniqueText()	
			this.redisplay()
			this.onSelect()
		}
	}

	getNodeStokeWidth(d) {
		if (this.selectedGraphs) {
			if (this.selectedGraphs[d.id]) {
				return 4;
			} else if (d.formType == 3) {
				return 0;
			} else if (d.formType == 0) {
				return 1;
			} else {
				return 1;//2
			}
		}
	}

	addNode(type, x, y, ctype, callback) {
		let xr = this.transform.invertX(x - this.common.jobW/2)
		let yr = this.transform.invertY(y - this.common.jobH/2)
		if (this.grid) {
			xr=Math.floor(xr);
			yr=Math.floor(yr);
			xr = xr - (xr%this.gridStep);
			yr = yr - (yr%this.gridStep);
		}
		let info = undefined
		if (type == "0") {
			info = this.common.getAppDefault()
		} else {
			info = this.common.getJobDefault()
		}
		this.common.getNewName(info)
		info.id = this.common.getNewId("NE")
		info.xywh = xr + " " + yr + " " + this.common.jobW + " " + this.common.jobH
		if (type == "1") {
			info.f_type = ctype
		}
		let node = this.common.addNode(info)
		if (node === undefined) {
			return false;
		}
		this.updated = true
		this.pushToUndo('add',node, true)
		if (callback !== undefined) {
			callback(info.id)
		}
		return true;
	}

	addLink(n1, n2, callback) {
		if (this.isClosedLink(n1, n2)) {
			console.log("closed graph forbidden")
			return false;
		}
		let info = this.common.getLinkDefault()
		info.from = n1
		info.to = n2
		this.common.getNewName(info)
		let id = this.common.getNewId("NE")
		let data = {
			id: id,
			from: info.from,
			to: info.to,
			ltype: '0',
			dtype: 0,
			dtype2: 0,
			info: info
		}
		let link = this.common.addLink(data)
		if (link === undefined) {
			return false;
		}
		this.updated = true
		this.pushToUndo('add',link, true)
		if (callback !== undefined) {
			callback(id, n1, n2)
		}
		return true
	}

	addText(x, y, w, h, texts, callback) {	
		if (texts === undefined) {
			texts = "enter\na text"
		}
		let id = this.common.getNewId("NE")
		let data = {
			id: id,
			x: x,
			y: y,
			w: w,
			h: h,
			v_desc: texts,
			back_color: "240,240,210", 
			fore_color: "0,0,0"
		}
		let box = this.common.addText(data)
		console.log(box)
		if (box == undefined) {
			return false
		}
		this.updated = true
		this.pushToUndo('add',box, true)
		if (callback !== undefined) {
			callback(id)
		}
		return true;
	}

	onSelect() {
		if (this.selectObjectCallback !== undefined) {
			let list = this.getSelectedObjectIds()
			this.selectObjectCallback(list)
		}
	}

	isDblclick() {
		if (this.clickTime2 !== undefined) {
			if ((Date.now() - this.clickTime2) < 500) {
				this.clickTime2 = undefined
				return true
			}
		}
		this.clickTime2 = Date.now()
		return false;
	}

	onDblclick(b) {
		if (this.dbClickOnObjectCallback !== undefined) {
			if (this.clickTime !== undefined) {
				if ((Date.now() - this.clickTime) < 500) {
					this.clickTime = undefined
					this.dbClickOnObjectCallback(b['id'])
					console.log(b)
					return true
				}
			}
			this.clickTime = Date.now()
		}
		return false
	}

	deleteSelectedLink() {
		if (this.selectedLink === undefined) {
			return
		}
		let id = this.selectedLink.id
		this.selectedLink = undefined
		for (let i=0; i<this.common.fullData.links.length; i++) {
			if (this.common.fullData.links[i].id == id) {
				this.pushToUndo('delete', this.common.fullData.links[i], false)
				this.common.fullData.links.splice(i, 1)
				this.redisplay(true)
				break;
			}
		}
	}

	deleteSelectedNodes() {
		let list = this.getSelectedObjectIds()
		if (list.length==0) {
			return
		}
		let tt=this;
		this.boxHandlers = undefined
		this.newUndoSession()
		list.forEach(function(id) {
			tt.deleteNode(id, true)
		})
		this.redisplay()
	}

	deleteNode(id, nrd) {
		if (id === undefined) {
			return
		}
		if (this.selectedLink !== undefined && this.selectedLink['id']==id) {
			this.selectedLink = undefined
			for (let i=0; i<this.common.fullData.links.length; i++) {
				if (this.common.fullData.links[i].id == id) {
					this.pushToUndo('delete', this.common.fullData.links[i], false)
					this.common.fullData.links.splice(i, 1)
					break;
				}
			}
		} else { 
			for (let i=0; i<this.common.fullData.nodes.length; i++) {
				if (this.common.fullData.nodes[i].id == id) {
					this.pushToUndo('delete', this.common.fullData.nodes[i])
					this.deleteNodeLinks(this.common.fullData.nodes[i].id, false)
					this.common.fullData.nodes.splice(i, 1)
					break;
				}
			}
			for (let i=0; i<this.common.fullData.boxes.length; i++) {
				if (this.common.fullData.boxes[i].id == id) {
					this.pushToUndo('delete', this.common.fullData.boxes[i], false)
					this.common.fullData.boxes.splice(i, 1)
					break;
				}
			}
			if (this.common.allNodes[id]) {
				delete this.common.allNodes[id]	
			}
			if (this.selectedGraphs[id] !== undefined) {
				delete this.selectedGraphs[id]
			}
		}
		if (!nrd) {
			this.redisplay();
		}

	}

	deleteNodeLinks(id) {
		for (let i=0; i< this.common.fullData.links.length; i++) {
			let link = this.common.fullData.links[i]
			if ((link.source == id || link.target == id)) {
				this.pushToUndo('delete', link, false)
				this.common.fullData.links.splice(i, 1)
				i--;
			}
		}
		return false
	}

	newUndoSession() {
		if (this.undo.length > this.undoIndex) {
			this.undo.splice(this.undoIndex)
		} else if (this.undo.length > this.common.undoMaxSize) {
			this.undo.splice(0, 1)
			this.undoIndex--
		}
		this.undo.push([])
		this.undoIndex++
		//console.log("undoIndex="+this.undoIndex)
	}

	pushToUndo(type, data, newSession) {
		if (newSession || this.undo.length == 0) {
			this.newUndoSession()
		}
		this.undo[this.undo.length-1].push({type: type, data: data})	
	}

	pushToUndoUpdateIfSameId(type, id, name, value) {
		if (this.undo.length == 0) {
			return
		}
		let lundo = this.undo[this.undo.length-1]
		if (lundo.length == 0) {
			return	
		}
		let undo = lundo[lundo.length - 1]
		if (undo.type != type || undo.data.id != id) {
			return
		}
		undo.data[name] = value
	}

	redoLast() {
		//console.log("undoIndex="+this.undoIndex+" ("+this.undo.length+")")
		if (this.undo.length==0 || this.undoIndex>this.undo.length) {
			return
		}
		let computeLinks = false
		let undoList = this.undo[this.undoIndex]
		if (undoList == undefined) {
			return
		}
		this.undoIndex++
		let tt = this

		undoList.forEach(function(undo) {
			if (undo.type == 'add') {
				let obj = undo.data
				if (obj.gtype == 'node') {
					tt.common.fullData.nodes.push(obj)
					tt.common.allNodes[obj.id] = obj
				}
				if (obj.gtype == 'box') {
					tt.common.fullData.boxes.push(obj)
					tt.common.allNodes[obj.id] = obj
				}
				if (obj.gtype == 'link') {
					tt.common.fullData.links.push(obj)
					tt.common.allNodes[obj.id] = obj
				}	
			}
			else if (undo.type == 'delete') {
				let obj = undo.data
				if (obj.gtype=='link') {
					for (let i=0; i<tt.common.fullData.links.length; i++) {
						if (tt.common.fullData.links[i].id == obj.id) {
							tt.common.fullData.links.splice(i, 1)
							break;
						}
					}
				}
				if (obj.gtype=='node') {
					for (let i=0; i<tt.common.fullData.nodes.length; i++) {
						if (tt.common.fullData.nodes[i].id == obj.id) {
							tt.common.fullData.nodes.splice(i, 1)
							break;
						}
					}
				}
				if (obj.gtype=='box') {
					for (let i=0; i<tt.common.fullData.boxes.length; i++) {
						if (tt.common.fullData.boxes[i].id == obj.id) {
							tt.common.fullData.boxes.splice(i, 1)
							break;
						}
					}
				}
			}
			else if (undo.type == 'move') {
				let data = undo.data
				let node = tt.common.allNodes[data.id]
				if (node) {
					computeLinks = true
					tt.boxHandlers = undefined
					node.x = data.newX
					node.y = data.newY
				}
			}
			else if (undo.type == 'moveText') {
				let data = undo.data
				let node = tt.common.allNodes[data.id]
				if (node) {
					node.textpos = data.newTextpos
				}
			}
			else if (undo.type == 'resize') {
				let data = undo.data
				let node = tt.common.allNodes[data.id]
				if (node) {
					tt.boxHandlers = undefined
					node.x = data.newBox.x
					node.y = data.newBox.y
					node.w = data.newBox.w
					node.h = data.newBox.h
					if (node.gtype == 'box') {
						let yy=(node.h-node.texts.length*12)/2+8;
						node.texts.forEach(
							function(b) {
								b.x = node.w/2
								b.y = yy
								yy = yy + 12
							}	
						)
					}
				}	
			}
			else if (undo.type == 'setInfo') {
				let data = undo.data
				let node = tt.common.allNodes[data.id]
				if (node) {
					node.info = data.newInfo
				}
			}
			else if (undo.type == 'updateLink') {
				let data = undo.data
				let node = tt.common.allNodes[data.id]
				if (node) {
					node.dtype = data.newDtype
				}	
				computeLinks = true
			}
			else if (undo.type == 'updateLinkDepth') {
				let data = undo.data
				let node = tt.common.allNodes[data.id]
				if (node) {
					node.dtype2 = data.newDtype2
				}	
				computeLinks = true
			}
		})
		this.redisplay(computeLinks)

	}

	undoLast() {
		//console.log("undoIndex="+this.undoIndex+" ("+this.undo.length+")")
		if (this.undo.length==0 || this.undoIndex==0) {
			return
		}
		let computeLinks = false
		let undoList = this.undo[this.undoIndex-1]
		if (undoList == undefined) {
			return
		}
		this.undoIndex--
		let tt = this

		undoList.forEach(function(undo) {
			if (undo.type == 'delete') {
				let obj = undo.data
				if (obj.gtype == 'node') {
					tt.common.fullData.nodes.push(obj)
					tt.common.allNodes[obj.id] = obj
				}
				if (obj.gtype == 'box') {
					tt.common.fullData.boxes.push(obj)
					tt.common.allNodes[obj.id] = obj
				}
				if (obj.gtype == 'link') {
					tt.common.fullData.links.push(obj)
					tt.common.allNodes[obj.id] = obj
				}	
			}
			else if (undo.type == 'add') {
				let obj = undo.data
				if (obj.gtype=='link') {
					for (let i=0; i<tt.common.fullData.links.length; i++) {
						if (tt.common.fullData.links[i].id == obj.id) {
							tt.common.fullData.links.splice(i, 1)
							break;
						}
					}
				}
				if (obj.gtype=='node') {
					for (let i=0; i<tt.common.fullData.nodes.length; i++) {
						if (tt.common.fullData.nodes[i].id == obj.id) {
							tt.common.fullData.nodes.splice(i, 1)
							break;
						}
					}
				}
				if (obj.gtype=='box') {
					for (let i=0; i<tt.common.fullData.boxes.length; i++) {
						if (tt.common.fullData.boxes[i].id == obj.id) {
							tt.common.fullData.boxes.splice(i, 1)
							break;
						}
					}
				}
			}
			else if (undo.type == 'move') {
				let data = undo.data
				let node = tt.common.allNodes[data.id]
				if (node) {
					computeLinks = true
					tt.boxHandlers = undefined
					node.x = data.x
					node.y = data.y
				}
			}
			else if (undo.type == 'moveText') {
				let data = undo.data
				let node = tt.common.allNodes[data.id]
				if (node) {
					node.textpos = data.textpos
				}
			}
			else if (undo.type == 'resize') {
				let data = undo.data
				let node = tt.common.allNodes[data.id]
				if (node) {
					tt.boxHandlers = undefined
					node.x = data.box.x
					node.y = data.box.y
					node.w = data.box.w
					node.h = data.box.h
					if (node.gtype == 'box') {
						let yy=(node.h-node.texts.length*12)/2+8;
						node.texts.forEach(
							function(b) {
								b.x = node.w/2
								b.y = yy
								yy = yy + 12
							}	
						)
					}
				}	
			}
			else if (undo.type == 'setInfo') {
				let data = undo.data
				let node = tt.common.allNodes[data.id]
				if (node) {
					node.info = data.info
				}
			}
			else if (undo.type == 'updateLink') {
				let data = undo.data
				let node = tt.common.allNodes[data.id]
				if (node) {
					node.dtype = data.dtype
				}	
				computeLinks = true
			}
			else if (undo.type == 'updateLinkDepth') {
				let data = undo.data
				let node = tt.common.allNodes[data.id]
				if (node) {
					node.dtype2 = data.dtype2
				}	
				computeLinks = true
			}
		})
		this.redisplay(computeLinks)
	}

	updateLink(dl) {
		if (!this.selectedLink) {
			return
		} 
		let dtype = this.selectedLink.dtype
		this.selectedLink.dtype+=dl
		if (this.selectedLink.dtype < 0) {
			this.selectedLink.dtype = 4
		}
		if (this.selectedLink.dtype > 4) {
			this.selectedLink.dtype = 0
		}
		if (this.lastLinkUpdated != this.selectedLink.id) {
			this.pushToUndo('updateLink', { id: this.selectedLink.id, dtype: dtype, newDtype: this.selectedLink.dtype }, true)
		} else {
			this.pushToUndoUpdateIfSameId('updateLink', this.selectedLink.id, 'newDtype', this.selectedLink.dtype)
		}
		this.lastLinkUpdated = this.selectedLink.id
		this.redisplay(true)
	}

	updateLinkDepth(dl) {
		if (!this.selectedLink) {
			return
		}
		if (this.selectedLink.dtype==2 || this.selectedLink.dtype==3) {
			return
		}
		let depth = this.selectedLink.dtype2
		this.selectedLink.dtype2+=dl
		if (this.selectedLink.dtype2 < -35) {
			this.selectedLink.dtype2 = 35
		}
		if (this.selectedLink.dtype2 > 35) {
			this.selectedLink.dtype2 = -35
		}
		//if (this.lastLinkUpdated != this.selectedLink.id) {
			this.pushToUndo('updateLinkDepth', { id: this.selectedLink.id, dtype2: depth, newDtype2: this.selectedLink.dtype2 }, true)
		//} else {
	//		this.pushToUndoUpdateIfSameId('updateLink', this.selectedLink.id, 'newDtype2', this.selectedLink.dtype2)
		//} 
		this.lastLinkUpdated = this.selectedLink.id
		this.redisplay(true)
	}

	moveUp(node) {
		let find = false
		if (node.gtype == "node") {
			for (let i=0; i<this.common.fullData.nodes.length; i++) {
				if (this.common.fullData.nodes[i].id == node.id) {
					this.common.fullData.nodes.splice(i, 1)
					find = true
					break;
				}
			}
			if (find) {
				this.common.fullData.nodes.push(node)
			}
		} else if (node.gtype == "box") {
			for (let i=0; i<this.common.fullData.boxes.length; i++) {
				if (this.common.fullData.boxes[i].id == node.id) {
					this.common.fullData.boxes.splice(i, 1)
					find = true
					break;
				}
			}
			if (find) {
				this.common.fullData.boxes.push(node)
			}
		}
		this.redisplay()
		this.mode = "info"
		console.log("setMode: info")
	}

	moveBottom(node) {
		let find = false
		if (node.gtype == "node") {
			for (let i=0; i<this.common.fullData.nodes.length; i++) {
				if (this.common.fullData.nodes[i].id == node.id) {
					this.common.fullData.nodes.splice(i, 1)
					find = true
					break;
				}
			}
			if (find) {
				this.common.fullData.nodes.unshift(node)
			}
		} else if (node.gtype == "box") {
			for (let i=0; i<this.common.fullData.boxes.length; i++) {
				if (this.common.fullData.boxes[i].id == node.id) {
					this.common.fullData.boxes.splice(i, 1)
					find = true
					break;
				}
			}
			if (find) {
				this.common.fullData.boxes.unshift(node)
			}
		}
		this.redisplay()
		this.mode = "info"
		console.log("setMode: info")
	}

	isClosedLink(n1, n2) {
		let node1 = this.common.allNodes[n1]
		this.linkp = node1.id
		this.linkpResult = false
		let node2 = this.common.allNodes[n2]
		let ret =  this.isClosedLinkEff(node2)
		return this.linkpResult
	}

	isClosedLinkEff(node) {	
		if (node.id == this.linkp) {
			this.linkpResult = true
			return
		}
		let list = this.common.getLinkedNodes(node)
		let tt = this
		list.forEach(function(nn) {
			let ret = tt.isClosedLinkEff(nn)
			if (ret) {
				return
			}
		})
	}

	tooltipEnter(node) {
		if (!d3.event.shiftKey) {
			return
		}
		let modeDebug = false
		if (d3.event.ctrlKey && d3.event.shiftKey) {
			modeDebug = true
		}
		//let rect = this.node.getBoundingClientRect()
		let xx = d3.event.clientX+20;
		let yy = d3.event.clientY;
		//let xx = this.transform.applyX(node.x) + rect.x + node.w * this.transform.k + 10
		//let yy = this.transform.applyY(node.y) + rect.y
    	this.nodeInfo.transition()		
			.duration(200)		
			.style("opacity", 1)
			.attr("class", "grapher-tooltip")
		this.nodeInfo.html(this.getHTMLTooltipData(node, modeDebug))	
			.style("position", "absolute")
			.style("left", xx + "px")		
			.style("top", yy + "px");	
	}

	tooltipLeave(node) {
		this.nodeInfo.transition()		
			.duration(500)		
			.style("opacity", 0);	
	}

	getHTMLTooltipData(node, modeDebug) {
		let ret = "<table>"
		ret +="<tr><td>type:<td><td>"+node.typeName+"<td></tr>"
		if (node.info['F_CTYPE'] !== undefined && node.info['F_CTYPE'] != "") {
			ret +="<tr><td>custom:<td><td>"+node.info['F_CTYPE']+"<td></tr>"
		}
		if (modeDebug) {
  			ret +="<tr><td>id:<td><td>"+node.id+"<td></tr>"
  		}
  		if (node.gtype == "box") {
			ret +="<tr><td>text:<td><td>"+node.info['V_DESC']+"<td></tr>"
  		} else {
			ret +="<tr><td>name:<td><td>"+node.text+node.text2+"<td></tr>"
			ret +="<tr><td>status:<td><td>"+this.common.statusText[node.status]+"<td></tr>"
			if (node.date) {
				ret +="<tr><td>date:<td><td>"+node.date+"<td></tr>"
			}
		}
		ret +="</table>"
		return ret
	}


//****************************************************************************************************
// public functions
//****************************************************************************************************

	getSelectedObjectIds() {
		if (this.selectedGraphs !== undefined) {
			let list = Object.keys(this.selectedGraphs)
			if (list.length > 0) {
				return list
			}
		}
		if (this.selectedLink) {
			return [this.selectedLink['id']]
		}
		return []
	}

	setSelectObjectCallback(callback) {
		this.selectObjectCallback = callback
	}

	setDbClickOnObjectCallback(callback) {
		this.dbClickOnObjectCallback = callback
	}

	isUpdated() {
		return updated;
	}

	setModeAddNode(type, ctype, callback) {
		if (!this.common.allowCreate) {
			if (callback !== undefined) {
				callback("notAllowed")
			}
			return
		}
		this.mode = "addNode"
		this.addModeData = {
			type: type,
			ctype: ctype,
			callback: callback
		}
		console.log("set mode: addNode");
	}

	setModeInfo() {
		if (this.prettyRun !== undefined) {
			clearInterval(this.prettyRun);
			this.prettyRun=undefined
		} 
		this.mode = "info"
		console.log("set mode: info")
	}

	setModeAddText(callback) {
		if (!this.common.allowCreate) {
			if (callback !== undefined) {
				callback("notAllowed")
			}
			return
		}
		this.mode = "addText"
		this.addModeData = {
			callback: callback
		}
		console.log("set mode: addText");
	}

	setModeAddLink(callback) {
		if (!this.common.allowCreate) {
			if (callback !== undefined) {
				callback("notAllowed")
			}
			return
		}
		this.mode = "addLink"
		this.addModeData = {
			callback: callback
		}
		this.link1 = undefined
		console.log("set mode: addLink");
	}

	setModeZoomByWindows() {
		this.mode = "zoomByWindow"
		this.addModeData = {}
		this.link1 = undefined
		console.log("set mode: zoomByWindow");	
	}

	setModeMoveUp(callback) {
		if (!this.common.allowMove) {
			if (callback !== undefined) {
				callback("notAllowed")
			}
			return
		}	
		this.mode = "moveUp"
		this.addModeData = {
			callback: callback
		}
		console.log("set mode: moveUp");
	}

	setModeMoveBottom(callback) {
		if (!this.common.allowMove) {
			callback("notAllowed")
			if (callback !== undefined) {
				return
			}
		}	
		this.mode = "moveBottom"
		this.addModeData = {
			callback: callback
		}
		console.log("set mode: moveBottom");
	}

	doPan(dx, dy) {
		this.dataGrid=undefined;
		this.transform.x = this.transform.x + dx;
		this.transform.y = this.transform.y + dy;
		this.redisplay()
		if (this.graphTotal !== undefined) {
			this.computeTotalRect(this.graphTotal);
			this.graphTotal.redisplayBox();				
		}		
	}

	doZoom(coef) {
		if (this.transform.k>5) {
			return
		}
		this.dataGrid=undefined;
		this.trxx = this.transform.invertX(this.width/2);
		this.tryy = this.transform.invertY(this.height/2);
		let k = this.transform.k * coef;
		if (k>3) {
			return
		}
		this.transform.k = k
		this.transform.x = this.width/2-this.trxx * this.transform.k;
		this.transform.y = this.height/2-this.tryy * this.transform.k;
				console.log(this.transform.k)
		this.redisplay()
		if (this.graphTotal !== undefined) {
			this.computeTotalRect(this.graphTotal);
			this.graphTotal.redisplayBox();	
		}	
	}

	doZoomTotal() {
		this.common.computeTotal(this, this.width, this.height);
		this.redisplay()
		if (this.graphTotal !== undefined) {
			this.computeTotalRect(this.graphTotal);
			this.graphTotal.redisplayBox();	
		}	
	}

	setGrid(status) {
		this.grid = status
		console.log("grid="+this.grid);
		this.redisplay()
	}

	isGrid() {
		return this.grid;
	}

	setObjectData(id, data) {
		let obj = this.common.allNodes[id]
		if (obj === undefined) {
			return false
		}
		this.pushToUndo('setInfo', {id: id, info: obj.info, newInfo: data})
		obj.info = data
		return true
	}

	getObjectData(id) {
		let obj = this.common.allNodes[id]
		if (obj === undefined) {
			return undefined
		}
		return obj.info
	}

	moveOnNode(nodeId, doNotCenter) {
		let node = this.common.allNodes[nodeId]
		if(node) {
			this.zoomOn(node.x, node.y, doNotCenter)
		}
	}

	setSelectedNodes(list) {
		this.selectedGraphs = {}
		list.forEach(function(node) {
			this.selectedGraphs[node.id] = node
		})
		this.redisplay()
	}

	setSelectedNodeByFunction(matchFunction) {
		let tt = this
		this.selectedGraphs = {}
		if (matchFunction === undefined) {
			return
		}
		this.common.fullData.nodes.forEach(function(node) {
			if (matchFunction(node)) {
				tt.selectedGraphs[node.id] = node
			}
		})
		this.redisplay()	
	}

	activateGraph(id) {
		this.selectedGraphs = {}
		this.common.activateGraph(id)
		this.graphId = id
	}

	reorganize(sens) {
		this.selectedGraphs = {}
		this.common.reorgNodes(sens) 
	}


//end class
}
