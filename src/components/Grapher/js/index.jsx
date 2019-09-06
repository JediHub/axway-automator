// index.jsx

import React from "react";
import ReactDOM from "react-dom";
import AGrapher from "./AGrapher";
import AGrapherTotal from "./AGrapherTotal";
import { GrapherCommon } from "./grapherCommon";
import DemoList from "./DemoList";
import TreeView from 'treeview-react-bootstrap';


var graphCommon = new GrapherCommon("http://localhost:5000/api/v1", "icons/grapher");
console.log(graphCommon)

/*
ReactDOM.render(
	React.createElement('div', null,
		React.createElement(AGrapherTotal, { common: graphCommon, width : 200, height: 134}, null),
		React.createElement(AGrapher, { grapherId: 'grapher1', common: graphCommon, width : 1200, height: 800}, null)
	), 
	document.getElementById("content")
);
*/

ReactDOM.render(
	<div>
		<div className="divLeftSide" style={{clear: 'left'}}>
			<AGrapherTotal common={graphCommon} width={200} height={134}/>
			<div style={{clear: 'left'}}>
			<DemoList width={200} height={800} common={graphCommon} />
			
			</div>
		</div>
		<AGrapher common={graphCommon} width={1200} height={800-134}/>
	</div>, 
	document.getElementById("content")
);

