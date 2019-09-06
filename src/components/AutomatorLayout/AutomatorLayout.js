import React from 'react';
import { ApplicationLayout, NavigationMenu } from 'axway-react-ui'
import MainContent from '../MainContent/MainContent';
import PrimaryNavigationMenu from '../PrimaryNavigationMenu/PrimaryNavigationMenu';
import SecondaryNavigationMenu from '../SecondaryNavigationMenu/SecondaryNavigationMenu';

export default class AutomatorLayout extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            primaryActive: null
        }
        this.menu = [];
    }

    componentDidMount() {
        this.menu = menu; // fetch menu; menu hardcoded at the end of this file for now
        const primaryActive = this.menu[0] ? this.menu[0].id : null; // default first primary link is active
        this.setState({ primaryActive });
    }

    onPrimaryActiveChange = (primaryActive) => this.setState({ primaryActive });

    render() {
        return (
            <ApplicationLayout hasHeader>
                <ApplicationLayout.Navigation>
                    <PrimaryNavigationMenu menu={this.menu} active={this.state.primaryActive} onChange={this.onPrimaryActiveChange} />
                    <SecondaryNavigationMenu />
                </ApplicationLayout.Navigation>

                <ApplicationLayout.Content>
                    <MainContent />
                </ApplicationLayout.Content>
            </ApplicationLayout>
        );
    }
}


const menu = [
    { id: 'designer', label: 'Designer', icon: 'pencil' }
];
