/* global document */
import 'bootstrap';
import 'open-iconic/font/css/open-iconic-bootstrap.min.css';

import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Router} from 'react-router';
import history from './history';
import fixpath from './fixpath';
import store from './store';
import App from './components/App';

import './index.m.scss';

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
    root,
);
