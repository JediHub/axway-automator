import React from 'react';
import AGrapher from "../Grapher/js/AGrapher";
import AGrapherTotal from "../Grapher/js/AGrapherTotal";
import { GrapherCommon } from "../Grapher/js/grapherCommon";
import DemoList from "../Grapher/js/DemoList";

export default class MainContent extends React.Component {

    
    render() {

    let graphCommon    = new GrapherCommon("http://localhost:5000/api/v1", "icons/grapher");
    
        return (
            <React.Fragment>
                <div className="MainContent">
                <div>
                    <div className="divLeftSide" style={{clear: 'left'}}>
                        <AGrapherTotal common={graphCommon} width={200} height={134}/>
                            <div style={{clear: 'left'}}>
                                <DemoList width={200} height={800} common={graphCommon} />
                            </div>
                        </div>
                        <AGrapher common={graphCommon} width={1200} height={800-134}/>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}