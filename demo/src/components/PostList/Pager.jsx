import React from 'react';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
const cx =classNames.bind(styles);

const PageNumber = ({page, onClick, selected}) => {
    const handleClick = () => {
        onClick(page);
    };

    return (
        <span onClick={handleClick} className={cx({selected})}>{page}</span>
    );
};

export default ({page, onPage}) => (
    <div className={cx('pagination')}>
        <PageNumber page={1} onClick={onPage} selected={page === 1} />
        <PageNumber page={2} onClick={onPage} selected={page === 2} />
        <PageNumber page={3} onClick={onPage} selected={page === 3} />
        <PageNumber page={4} onClick={onPage} selected={page === 4} />
        <PageNumber page={5} onClick={onPage} selected={page === 5} />
    </div>
);
