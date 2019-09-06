import React from 'react';
import { NavigationMenu } from 'axway-react-ui'

export default class PrimaryNavigationMenu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            collapsed: true
        }
    }

    onToggle = (collapsed) => this.setState({ collapsed });

    render() {
        return (
            <NavigationMenu onToggle={this.onToggle} collapsed={this.state.collapsed}>
                <NavigationMenu.Links>
                    {this.props.menu.map(link => (
                        <NavigationMenu.Link
                            key={link.id} 
                            onClick={() => this.props.onChange(link.id)}
                            active={link.id === this.props.active}
                            icon={link.icon}>
                            {link.label}
                        </NavigationMenu.Link>
                    ))}
                </NavigationMenu.Links>
            </NavigationMenu>
        );
    }
}
