import {render} from '@hot-loader/react-dom';
import 'open-iconic/font/css/open-iconic-bootstrap.css'
import 'bootstrap/dist/css/bootstrap.css';
import App from './components/App';
import './index.css';

const root = document.createElement('div');

document.body.appendChild(root);

render(<App />, root);
