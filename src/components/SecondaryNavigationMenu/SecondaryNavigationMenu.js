import React from "react";
import { NavigationMenu } from "axway-react-ui";
import DesignerView from "../DesignerView/DesignerView";
import "./SecondaryNavigationMenu.scss";

const VIEWS = {
  designer: 'designer'
}

const getView = (type) => {
  switch (type) {
    case VIEWS.designer:
      return <DesignerView />
    default:
      return <NoItems />
  }
}

const NoItems = () => <span>Nothing Here</span>

export default class SecondaryNavigationMenu extends React.Component {

  render() {
    const view = getView('designer');

    return (
      <NavigationMenu type="secondary" header="Designer">
        {view}
      </NavigationMenu>
    );
  }
}
