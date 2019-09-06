
import * as d3 from "d3";

export class GrapherTotal {

	constructor(common, width, height) {
		this.common = common
		this.common.graphTotal = this
		this.width = width;
		this.height = height;
		this.svg = null;
		this.limitAll = this.common.limitAll;
		this.limitGraph = this.common.limitGraph;
		this.transform = d3.zoomIdentity.scale(0.8);//ne pas mettre 1.
		if (common.graph !== undefined) {
			common.graph.graphTotal = this
			this.graphs = common.graph
		}
	}

	display(node) {
		this.node = node
		this.svg = d3.select(node)
			.style("background", "#F0F0F0")
			//.attr("class", "grapher-total-space")
			.on("wheel", this.zoomed.bind(this))
			.on("mousedown", this.startRectMove.bind(this))
			.on("mousemove", this.moveRect.bind(this))
			.on("mouseup", this.endRectMove.bind(this));

		this.graphs.computeTotalRect(this);
		this.redisplay();
		this.svg.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width",this.width)
			.attr("height", this.height)
			.attr("stroke", "red")
			.attr("fill", "none")
			.style("pointer-events", "none")
	}

	redisplayBox() {
		d3.selectAll("#totalBox").remove();
		this.svg.append("rect")
			.attr("id", "totalBox")
			.attr("transform", this.transform.toString())
			.attr("x", this.xr)
			.attr("y", this.yr)
			.attr("width",this.wr)
			.attr("height", this.hr)
			.attr("stroke", "red")
			.attr("stroke-width", 2/this.transform.k)
			.attr("fill", "none")
			.style("pointer-events", "none")
	}

	marker(color) {
        this.svg.append("svg:marker")
          .attr("id", color.replace("#", ""))
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 15)
          .attr("refY", 0)
          .attr("markerWidth", 9)
          .attr("markerHeight", 9)
          .attr("orient", "auto")
          .attr("markerUnits", "userSpaceOnUse")
          .append("svg:path")
          .attr("d", "M0,-5L10,0L0,5")
          .style("fill", color);

        return "url(" + color + ")";
    }

	redisplay() {
		if (this.common.fullData.nodes === undefined) {	
			return;
		}
		this.common.computeTotal(this, this.width, this.height);
		this.limitAll = this.common.limitTotalAll;
		this.limitGraph = this.common.limitGraph;
		if (this.common.fullData.nodes.length<=10000) {
			this.limitAll = 0
			this.limitGraph = 0
		}
		d3.selectAll("svg.agraphert > *").remove();

		let tt=this;
		
		if (this.common.fullData.boxes) {
			if (this.transform.k>this.limitAll) {
				this.svg.append("g")
				 .attr("class", "boxes")
				 .selectAll("rect")
				 .data(this.common.fullData.boxes)
				 .enter().append("rect")
			 		.attr("transform", this.transform.toString())
					.attr("x", function(d) { return d.x})
					.attr("y", function(d) { return d.y})
				 	.attr("width", function(d) { return d.w; })
				 	.attr("height", function(d) { return d.h; })
				 	.style("stroke-width", 1)
				 	.style("fill", function(d) { return d.color; })
				 	.style("pointer-events", "none")
				 	.attr("stroke", 'black')
			}
		}
		if (this.common.fullData.links) {
			if (this.transform.k>this.limitGraph) {
				this.svg.append("g")
					.selectAll(".link")
					.data(this.common.fullData.links)
					.enter().append("path")
					.attr( "class", "grapher-link")
					.attr("transform", this.transform.toString())
					.attr("d", function(d) { return d.path; })
					//.style("stroke", tt.common.getLinkColor)
					.style("fill", "none")
					.attr("stroke",  function(b) { return tt.common.getLinkColor(b); })
					.style("stroke-width", 0.5/this.transform.k )
					.style("stroke-dasharray", tt.common.getLinkDash)
					.style("pointer-events", "none")
					.attr("marker-end", function(b) { return tt.marker(tt.common.getLinkColor(b)); })
			}
		}
		if (this.common.fullData.nodes) {
			if (this.transform.k>this.limitAll) {
				this.svg.append("g")
					.attr("class", "nodes")
					.selectAll("rect")
					.data(this.common.fullData.nodes)
					.enter().append("rect")
						.attr("transform", this.transform.toString())
						.attr("x", function(d) { return d.x})
						.attr("y", function(d) { return d.y})
						.attr("width", function(d) { return d.w})
						.attr("height", function(d) { return d.h})
						.attr("fill", function(d) { return tt.common.statusColor[d.status]})
						.attr("stroke", 'black')
						.attr("stroke-width", 0.2/this.transform.k)
						.style("pointer-events", "none")
			} else {
				this.svg.append("rect")
					.attr("transform", this.transform.toString())
					.attr("x", this.common.xmin)
					.attr("y", this.common.ymin)
					.attr("width", (this.common.xmax-this.common.xmin))
					.attr("height", (this.common.ymax-this.common.ymin))
					.attr("stroke", "black")
					.style("pointer-events", "none")
					.attr("stroke-width", 1/this.transform.k)
					.attr("fill", "lightgrey")
			}
	 	}
		this.redisplayBox();
	}

	zoomed() {
		this.graphs.mousex = this.graphs.width/2;
		this.graphs.mousey = this.graphs.height/2;
		this.graphs.zoomed()
	}

	startRectMove() {
		let rect = this.node.getBoundingClientRect()
		this.winx = rect.x
		this.winy = rect.y
		this.xx = this.transform.invertX(d3.event.clientX - this.winx)
		this.yy = this.transform.invertY(d3.event.clientY - this.winy)
		this.moved = false
		this.moveStarted = true
	}

	moveRect() {
		if (!this.moveStarted) {
			return
		}
		this.moved = true
		this.xx = this.transform.invertX(d3.event.clientX - this.winx)
		this.yy = this.transform.invertY(d3.event.clientY - this.winy)
		this.xr = this.xx - this.wr/2;
		this.yr = this.yy - this.hr/2;
		this.redisplayBox();
		this.graphs.transform.x = -this.xx * this.graphs.transform.k + this.wr/2 * this.graphs.transform.k
		this.graphs.transform.y = -this.yy * this.graphs.transform.k + this.hr/2 * this.graphs.transform.k
		this.graphs.redisplay(false, true)
	}

	endRectMove() {
		this.moveStarted = false
		if (this.moved) {
			return;
		}
		this.xx = this.transform.invertX(d3.event.clientX - this.winx)
		this.yy = this.transform.invertY(d3.event.clientY - this.winy)
		this.xr = this.xx - this.wr/2;
		this.yr = this.yy - this.hr/2;
		this.redisplayBox();
		this.graphs.transform.x = -this.xx * this.graphs.transform.k + this.wr /2 * this.graphs.transform.k
		this.graphs.transform.y = -this.yy * this.graphs.transform.k + this.hr /2 * this.graphs.transform.k
		this.graphs.redisplay(false, true)
	}

//end class
}
