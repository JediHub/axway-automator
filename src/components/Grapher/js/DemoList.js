// DemoList

import React from "react";
import { RestUtil } from "./restUtil";
import { GrapherCommon } from "./grapherCommon";


export default class DemoList extends React.Component {
	constructor(props) {
		super(props);
		this.graphCommon = props.common
		this.data = []
		this.restUtil = this.graphCommon.restUtil
		this.previousLine = undefined
		let tt = this
		this.restUtil.login("OPADMIN", "iris2018", "ms400", "10500", function(status, val) {
			tt.restUtil.getGraphList(function(status, data) {
				tt.data = data.data
				tt.setState({ key: Math.random() });
			})
		})
		console.log("this")
		console.log(tt);
	}

	componentDidMount() {
	}

	componentDidUpdate() {
	}

	loadGraph(b) {
		let graphid = b.target.getAttribute("graphid")
		if (this.previousLine !== undefined) {
			this.previousLine.setAttribute("class", "buttonList")
		}
		this.previousLine = b.target
		b.target.setAttribute("class", "buttonListSelected")
		console.log(graphid)
		let tt = this
		this.graphCommon.getGraph(graphid, null, function(ret) {
				console.log("graph"+graphid+" loaded ("+ret+")")
				tt.graphCommon.currentGrapher.display(graphid, tt.graphCommon.currentGrapher.node);
			}.bind(tt))
	}

	render() {
		let elems =[]
		let tt = this
		this.data.forEach(function(graph) {
			elems.push(
				React.createElement('tr', null, 
					React.createElement('td', { className: 'buttonList', padding:2, border:12, onClick: tt.loadGraph.bind(tt), graphid: graph.id_key}, 
						graph.v_ename
					)
				)
			)
		})
		return React.createElement('table', { className: 'tableList'}, 
			React.createElement('tbody', null ,...elems)
		)
	}
}
