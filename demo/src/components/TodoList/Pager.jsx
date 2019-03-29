import {NavLink} from 'react-router-dom';
import {e2e} from '../../utils';
import cx from './index.m.scss';

const PageNumber = ({page, active}) => (
    <li className={cx('page-item', {active})} aria-current={active ? 'page' : undefined}>
        <NavLink
            to={`/todo-list/${page}`}
            className={cx('page-link', e2e(`page-${page}`))}
        >
            {page}
            {active && (<span className="sr-only">(current)</span>)}
        </NavLink>
    </li>
);

export default ({page}) => (
    <nav aria-label="Page navigation example">
        <ul className="pagination justify-content-center">
            {
                [1, 2, 3, 4, 5].map(i => (
                    <PageNumber key={i} page={i} active={i === page} />
                ))
            }
        </ul>
    </nav>
);
