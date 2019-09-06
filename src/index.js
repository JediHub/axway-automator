import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl'
import App from './components/App/App';
import './main.scss'

// Render the Root element into the DOM
ReactDOM.render(
	<IntlProvider locale="en">
		<App />
	</IntlProvider>,
	document.getElementById('app'),
);
