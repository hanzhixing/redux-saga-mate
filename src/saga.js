import {createAction} from 'redux-actions';
import {call, put, select} from 'redux-saga/effects';
import {idOfAction, isFinished, failWith, succeedWith} from './action';

// reducer和saga的执行顺序见下方issue
// @see: https://github.com/redux-saga/redux-saga/issues/148
export const makeCreateDefaultWorker = ([ErrorType, CleanupActionType], autoclear = true) => (
    (method, payload) => {
        return function* defaultWorkerSaga(action) {
            try {
                if (isFinished(action)) {
                    return;
                }

                const state = yield select();

                const json = yield call(method, (payload ? payload(state, action) : action.payload));

                yield put(succeedWith(json)(action));

                if (autoclear) {
                    yield put(createAction(CleanupActionType)(idOfAction(action)));
                }
            } catch (error) {
                if (error instanceof ErrorType) {
                    yield put(failWith(error)(action));
                    return;
                }
                throw error;
            }
        };
    }
);
