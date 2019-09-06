import React from "react";
import { SearchBar } from "axway-react-ui";
import { FormControl } from 'react-bootstrap';
import TreeMenu from "../TreeMenu/Treemenu";
import "./DesignerView.scss";

export default class DesignerView extends React.Component {
    render() {
        return (
            <React.Fragment>
                <SearchBar className="designer-searchbar" placeholder="Chart name" />
                <FormControl className="view-select" componentClass="select" placeholder="select">
                    <option value="milk">AutView</option>
                    <option value="eggs">MyView</option>
                    <option value="bread">YourView</option>
                </FormControl>

                <div>
                    <h5 className="tree-box-header">Charts</h5>
                    <div className="tree-box">
                        <TreeMenu />
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
