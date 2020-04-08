import {call, put, select} from 'redux-saga/effects';
import {idOfAction, isFinished, failWith, succeedWith} from './action';

// reducer和saga的执行顺序见下方issue
// @see: https://github.com/redux-saga/redux-saga/issues/148
export const makeCreateDefaultWorker = (
    [ErrorType, CleanupActionType],
    {autoclear: autoclearByWorkerMaker} = {},
) => (method, payload, {autoclear: autoClearByWorker} = {}) => (
    function* defaultWorkerSaga(action) {
        try {
            if (isFinished(action)) {
                return;
            }

            const state = yield select();

            const json = yield call(method, (payload ? payload(state, action) : action.payload));

            yield put(succeedWith(json)(action));

            if (autoClearByWorker === true) {
                yield put({type: CleanupActionType, payload: idOfAction(action)});
                return;
            }
            if (autoClearByWorker === false) {
                return;
            }
            if (autoclearByWorkerMaker === true) {
                yield put({type: CleanupActionType, payload: idOfAction(action)});
                return;
            }
        } catch (error) {
            if (error instanceof ErrorType) {
                yield put(failWith(error)(action));
                return;
            }
            throw error;
        }
    }
);
