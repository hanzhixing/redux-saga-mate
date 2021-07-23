import {always} from 'ramda';
import {call, put, select, take, fork, cancel} from 'redux-saga/effects';
import {idOfAction, isFinished, failWith, succeedWith} from './action';

// Sagas and reducers: order of execution
// @see: https://github.com/redux-saga/redux-saga/issues/148
export const makeCreateDefaultWorker = ({
    shouldCatch = always(false),
    cleanupActionType,
    autoclear: autoclearOfWorkerCreatorFactory,
} = {}) => (
    method,
    payload,
    {autoclear: autoclearOfWorkerCreator} = {},
) => (function* defaultWorkerSaga(action) {
    try {
        if (isFinished(action)) {
            return;
        }

        const state = yield select();

        const json = yield call(method, (payload ? payload(state, action) : action.payload));

        yield put(succeedWith(json)(action));

        if (autoclearOfWorkerCreator === true && cleanupActionType) {
            yield put({type: cleanupActionType, payload: idOfAction(action)});
            return;
        }
        if (autoclearOfWorkerCreator === false) {
            return;
        }
        if (autoclearOfWorkerCreatorFactory === true) {
            yield put({type: cleanupActionType, payload: idOfAction(action)});
            return;
        }
    } catch (error) {
        if (typeof shouldCatch === 'function' && shouldCatch(error)) {
            yield put(failWith(error)(action));
            return;
        }
        throw error;
    }
});

export const takeLatestDeep = (pattern, saga, ...args) => fork(function* () {
    const tasks = {};

    while (true) {
        const action = yield take(pattern);

        const id = idOfAction(action);

        if (tasks[id]) {
            yield cancel(tasks[id]);
        }

        tasks[id] = yield fork(saga, ...args.concat(action));
    }
});
