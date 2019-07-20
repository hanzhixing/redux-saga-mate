/* global document */
import 'bootstrap';

import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Router} from 'react-router';
import history from './history';
import fixpath from './fixpath';
import store from './store';
import App from './components/App';

import 'open-iconic/font/css/open-iconic-bootstrap.css'
import './index.scss';

fixpath();

const root = document.createElement('div');

root.setAttribute('id', 'react-root');

document.body.appendChild(root);

render(
    <Provider store={store}>
        <Router history={history}>
            <App />
        </Router>
    </Provider>,
    root
);
