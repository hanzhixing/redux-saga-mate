import {hot} from 'react-hot-loader/root';
import {Switch, Route, Redirect, NavLink} from 'react-router-dom';
import loadable from '@loadable/component';
import GithubCat from './GithubCat.svg';

const PostList = loadable(() => import(
    /* webpackChunkName: "PostList" */
    '../../connects/PostList'
), {fallback: null});

const SimpleButtons = loadable(() => import(
    /* webpackChunkName: "SimpleButtons" */
    '../SimpleButtons'
));

const navs = [
    {
        to: `/simple-buttons`,
        text: 'Simple Buttons',
    },
    {
        to: `/post-list`,
        text: 'Post List',
    },
];

const NavItem = ({to, text}) => (
    <li className="nav-item">
        <NavLink
            className="nav-link"
            activeClassName="active h5"
            to={to}
        >
            {text}
        </NavLink>
    </li>
);

const App = () => (
    <>
        <header className="col-12 text-center mt-3 mb-5">
            <a href="https://github.com/hanzhixing/redux-saga-mate.git" target="_blank" rel="noopener noreferrer">
                <GithubCat />
            </a>
        </header>
        <div className="container-fluid">
            <div className="row flex-xl-nowrap">
                <nav className="col-2 border-left">
                    <ul className="nav flex-column">
                        {
                            navs.map(({to, text}, i) => (
                                <NavItem key={i} to={to} text={text} />
                            ))
                        }
                    </ul>
                </nav>
                <main className="col-10 border-left border-right">
                    <Route exact path="/" component={SimpleButtons} />
                    <Route path="/simple-buttons" component={SimpleButtons} />
                    <Switch>
                        <Route exact path="/post-list">
                            {() => (<Redirect to="/post-list/1" />)}
                        </Route>
                        <Route path="/post-list/:page">
                            {
                                ({match: {params: {page}}}) => (<PostList page={page} />)
                            }
                        </Route>
                    </Switch>
                </main>
            </div>
        </div>
    </>
);

export default hot(App);
