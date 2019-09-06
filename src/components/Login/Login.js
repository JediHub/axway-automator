import React from 'react';
import { Form, FormGroup, FormControl, ControlLabel, Col, Button, Alert } from 'react-bootstrap';
import { AutomatorAPI } from '../../utils/services';
import './Login.scss';

export default class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            credentials: {
                user: '',
                pwd: '',
                server: '',
                port: ''
            },
            error: ''
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        const { user, pwd, server, port } = this.state.credentials;

        AutomatorAPI.login(user, pwd, server, port).then(() => {
            if (AutomatorAPI.getLoginStatus()) {
                this.setState({ error: '' });
                this.props.onLogIn();
            } else {
                this.setState({ error: 'Some Error Occured !! Please Retry.' });
            }
        });
    }

    onChange = (e) => {
        const target = e.target;
        this.setState(state => ({ credentials: { ...state.credentials, [target.name]: target.value } }));
    }

    render() {

        const { user, pwd, server, port } = this.state.credentials;

        return (
            <div className="login-box">
                {this.state.error && <Alert bsStyle="warning">{this.state.error}</Alert>}
                <Form horizontal onSubmit={this.onSubmit}>
                    <FormGroup controlId="user">
                        <Col componentClass={ControlLabel} sm={2}>
                            Username
                        </Col>
                        <Col sm={10}>
                            <FormControl type="text" name="user" placeholder="Username" value={user} onChange={this.onChange} />
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="pwd">
                        <Col componentClass={ControlLabel} sm={2}>
                            Password
                        </Col>
                        <Col sm={10}>
                            <FormControl type="password" name="pwd" placeholder="Password" value={pwd} onChange={this.onChange} />
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="server">
                        <Col componentClass={ControlLabel} sm={2}>
                            M-Server
                        </Col>
                        <Col sm={10}>
                            <FormControl type="text" name="server" placeholder="M-Server" value={server} onChange={this.onChange} />
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="port">
                        <Col componentClass={ControlLabel} sm={2}>
                            Port
                        </Col>
                        <Col sm={10}>
                            <FormControl type="text" name="port" placeholder="Port" value={port} onChange={this.onChange} />
                        </Col>
                    </FormGroup>

                    <FormGroup>
                        <Col smOffset={2} sm={10}>
                            <Button type="submit" bsSize="large">Login</Button>
                        </Col>
                    </FormGroup>
                </Form>
            </div>
        );
    }
}
