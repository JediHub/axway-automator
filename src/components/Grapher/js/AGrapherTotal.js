// AGrapher.jsx

import React from "react";
import { GrapherTotal } from "./grapherTotal"
import { GrapherCommon } from "./grapherCommon"

export default class AGrapherTotal extends React.Component {
	constructor(props) {
		super(props);
		this.graphTotal = new GrapherTotal(props.common, props.width, props.height);
	}

	componentDidMount() { 
		console.log(this.graphTotal);
		console.log(this.refs.graphert);
		this.graphTotal.display(this.refs.graphert);
	}

	componentDidUpdate() {
		this.graphTotal.redisplay(this.refs.graphert)
	}

	render() {
		return React.createElement('div', { className: "agraphert" },
			React.createElement('svg', { className: 'agraphert', width : this.props.width, height: this.props.height, ref: "graphert"})
		)
	}
}
