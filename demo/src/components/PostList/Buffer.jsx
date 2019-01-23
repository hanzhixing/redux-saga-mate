import React from 'react';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
const cx =classNames.bind(styles);

export default ({buffer, onAccept}) => (
    <tr key="buffer">
        <td colSpan="5" className="text-center">
            {`${buffer.length} new records, click to`}
            {' '}
            <span onClick={onAccept} className={cx('accept')}>accpet!</span>
        </td>
    </tr>
);
