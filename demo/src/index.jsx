import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {createBrowserHistory} from 'history';
import {Router} from 'react-router';
import store from './store';
import App from './components/App';

import 'open-iconic/font/css/open-iconic-bootstrap.css'
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';

const history = createBrowserHistory()

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
