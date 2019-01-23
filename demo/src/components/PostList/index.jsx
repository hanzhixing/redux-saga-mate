import React from 'react';
import Pager from './Pager';
import AuthorModal from './AuthorModal';
import MaybeDataRows from '../../connects/PostList/MaybeDataRows';
import MaybeBuffer from '../../connects/PostList/MaybeBuffer';

export default ({
    modalAuthor,
    page,
    selected,
    onPage,
    onToggleCheck,
    onCloseAuthorModal,
    onBatchStar,
    actionIds,
    transients,
    onTrackAsyncAction,
    onUntrackAsyncAction,
}) => (
    <div className="mx-auto" style={{marginTop: '50px', width: '1200px'}}>
        <table className="table table-md">
            <thead>
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
                    actionIds={actionIds}
                    transients={transients}
                    onToggleCheck={onToggleCheck}
                    onTrackAsyncAction={onTrackAsyncAction}
                    onUntrackAsyncAction={onUntrackAsyncAction}
                />
                <MaybeBuffer page={page} transients={transients} />
            </tbody>
        </table>
        <div><button onClick={onBatchStar}>Star selected</button><br /><br /></div>
        <Pager onPage={onPage} page={page} />
        {!!modalAuthor && (<AuthorModal {...modalAuthor} onCloseAuthorModal={onCloseAuthorModal} />)}
    </div>
);
