// AGrapher.jsx

import React from "react";
import { Grapher } from "./grapher"
import { GrapherCommon } from "./grapherCommon"

export default class AGrapher extends React.Component {
	constructor(props) {
		super(props);
		this.graphCommon = props.common
		this.grapherId = props.grapherId
		this.graph = new Grapher(this.graphCommon, props.width, props.height);
		this.graph.setSelectObjectCallback(function(list) {
			console.log("callback selected:")
			console.log(list)
		})
		this.graph.setDbClickOnObjectCallback(function(id) {
			console.log("dblClick on: "+id)
		})
	}

	componentDidMount() {
		this.graph.init(this.refs.grapher);
	}

	componentDidUpdate() {
		this.graph.init(this.refs.grapher);
		this.graph.redisplay(this.refs.grapher)
	}

	render() {
		return React.createElement('div', { className: 'agrapher' },
			React.createElement('svg', { className: 'agrapher', width : this.props.width, height: this.props.height, ref: "grapher"})
		)
	}
}
