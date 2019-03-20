import {NavLink} from 'react-router-dom';

export default () => (
    <ul className="nav flex-column">
        <li className="nav-item">
            <NavLink exact className="nav-link" activeClassName="active h5" to="/">Home</NavLink>
        </li>
        <li className="nav-item">
            <NavLink className="nav-link" activeClassName="active h5" to="/simple-button">Simple Button</NavLink>
        </li>
    </ul>
);
