import {e2e} from '../../utils';
import cx from './index.m.scss';

export default ({
    id,
    title,
    author,
    commenters,
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
                {author}
                {' '}
                <button
                    type="button"
                    onClick={handleViewAuthor}
                    className={cx('oi oi-eye', e2e('view-author'))}
                />
                {' '}
                {commenters.length}
            </td>
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
                        <button
                            type="button"
                            onClick={handleStar}
                            className={cx('oi oi-star', 'no-border', {star}, e2e('star-todo'))}
                        />
                    )
                }
                {' '}
                {
                    (onStarTransient && !onStarTransient.isLoading && onStarTransient.error) && (
                        <button
                            type="button"
                            className={cx('text', 'text-danger', 'no-border', e2e('confirm-star-error'))}
                            onClick={handleConfirmError}
                        >
                            Failed! Click to Dimiss!
                        </button>
                    )
                }
            </td>
        </tr>
    );
};
