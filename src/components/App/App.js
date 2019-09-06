import React from 'react';
import { Header } from 'axway-react-ui'
import AutomatorLayout from '../AutomatorLayout/AutomatorLayout';
import Login from '../Login/Login';
import { AutomatorAPI } from '../../utils/services';

export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            //isLoggedIn: false
            isLoggedIn: true
        }
    }

    componentDidMount() {
        //this.setState({ isLoggedIn: AutomatorAPI.getLoginStatus() });
    }

    onLogIn = () => this.setState({ isLoggedIn: true });

    render() {
        return (
            <div>
                <Header>Automator</Header>
                {this.state.isLoggedIn ? < AutomatorLayout /> : <Login onLogIn={this.onLogIn} />}
            </div>
        );
    }
}
