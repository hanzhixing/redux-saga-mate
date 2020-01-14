import {all, takeEvery} from 'redux-saga/effects';
import {makeCreateDefaultWorker} from 'redux-saga-mate';
import {MyError} from '../api/errors';
import * as ActionTypes from '../actions/types';
import * as Api from '../api';

const createDefaultWorker = makeCreateDefaultWorker(
    [MyError, ActionTypes.CLEANUP],
    {autoclear: true},
);

// Notice!
// If you need more complicated logic controls then the default worker saga,
// you need to implement your own worker sagas.
export default function* () {
    yield all([
        takeEvery(ActionTypes.ASYNC_NOOP, createDefaultWorker(Api.noop)),
        takeEvery(ActionTypes.ASYNC_GET_MANY_TODO, createDefaultWorker(Api.getManyTodo)),
        takeEvery(ActionTypes.ASYNC_PATCH_ONE_TODO, createDefaultWorker(Api.patchOneTodo)),
        takeEvery(ActionTypes.ASYNC_GET_ONE_USER_BY_TODO_ID, createDefaultWorker(
            Api.getOneUser,
            (state, action) => {
                const {todoId} = action.payload;
                const {author} = state.entities.todos[todoId];
                return {id: author};
            },
            // {autoclear: false},
        )),
    ]);
}
