import Pager from './Pager';
import AuthorModal from './AuthorModal';
import MaybeDataRows from '../../connects/TodoList/MaybeDataRows';
import MaybeBuffer from '../../connects/TodoList/MaybeBuffer';
import {e2e} from '../../utils';
import cx from './index.m.scss';

export default ({
    page,
    modalTodoAuthor,
    modalAuthorInfo,
    selected,
    onToggleCheck,
    onCloseAuthorModal,
    onBatchStar,
    onTrackAsyncAction,
    onUntrackAsyncAction,
    onViewAuthor,
}) => (
    <div className="mx-auto">
        <table className="table">
            <thead className="thead-dark">
                <tr>
                    <th scope="col">Id</th>
                    <th scope="col">Title</th>
                    <th scope="col">Author/Commenter Number</th>
                    <th scope="col">E-mail</th>
                    <th scope="col" style={{width: '200px'}}>Operation</th>
                </tr>
            </thead>
            <tbody>
                <MaybeDataRows
                    page={page}
                    selected={selected}
                    onToggleCheck={onToggleCheck}
                    onTrackAsyncAction={onTrackAsyncAction}
                    onUntrackAsyncAction={onUntrackAsyncAction}
                    onViewAuthor={onViewAuthor}
                />
                <MaybeBuffer page={page} />
            </tbody>
        </table>
        <div>
            <button
                type="button"
                onClick={onBatchStar}
                className={cx('btn btn-primary btn-sm', e2e('batch-star'))}
            >
                Star selected
            </button>
            <br />
            <br />
        </div>
        <Pager page={page} />
        {!!modalTodoAuthor && (<AuthorModal {...modalAuthorInfo} onCloseAuthorModal={onCloseAuthorModal} />)}
    </div>
);
