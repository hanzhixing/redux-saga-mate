import {all, takeEvery} from 'redux-saga/effects';
import {makeCreateDefaultWorker} from 'redux-saga-mate';
import {MyError} from '../api/errors';
import * as ActionTypes from '../actions/types';
import * as Api from '../api';

const createDefaultWorker = makeCreateDefaultWorker([MyError, ActionTypes.CLEANUP]);

// Notice!
// If you need more complicated logic controls then the default worker saga,
// you need to implement your own worker sagas.
export default function* () {
    yield all([
        takeEvery(ActionTypes.ASYNC_GET_MANY_POST, createDefaultWorker(Api.getManyPost)),
        takeEvery(ActionTypes.ASYNC_PATCH_ONE_POST, createDefaultWorker(Api.patchOnePost)),
        takeEvery(ActionTypes.ASYNC_GET_ONE_USER_BY_POST_ID, createDefaultWorker(
            Api.getOneUser,
            (state, action) => {
                const {postId} = action.payload;
                const {author} = state.entities.posts[postId];
                return {id: author};
            }
        )),
    ]);
}
