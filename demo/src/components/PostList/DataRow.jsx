import React from 'react';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
const cx =classNames.bind(styles);

export default ({
    id,
    title,
    author,
    commenters,
    email,
    star,
    onStar,
    onStarTransient,
    onClearStarLoading,
    onViewAuthor,
    isChecked,
    onToggleCheck,
}) => {
    const handleStar = () => {
        onStar(id);
    };

    const handleConfirmError = () => {
        onClearStarLoading(id);
    };

    const handleViewAuthor = () => {
        onViewAuthor(id);
    }

    const handleToggleCheck = () => {
        onToggleCheck(id);
    }

    return (
        <tr>
            <th scope="row">
                <input type="checkbox" checked={isChecked} onChange={handleToggleCheck} />
                {' '}
                {id}
            </th>
            <td>{title}</td>
            <td className={cx('operation')}>
                {author}{' '}
                <span className="oi oi-eye" onClick={handleViewAuthor}></span>
                {' '}({commenters.length})
            </td>
            <td>{email}</td>
            <td className={cx('operation')}>
                {' '}
                {
                    onStarTransient && onStarTransient.isLoading && (
                        <div className="spinner-border spinner-border-sm" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    )
                }
                {
                    (!onStarTransient || !onStarTransient.isLoading) && (
                        <span className={cx('oi', 'oi-star', {star})} onClick={handleStar}></span>
                    )
                }
                {' '}
                {
                    (onStarTransient && !onStarTransient.isLoading && onStarTransient.error) && (
                        <span className={cx('error')} onClick={handleConfirmError}>Failed!</span>
                    )
                }
            </td>
        </tr>
    );
};
