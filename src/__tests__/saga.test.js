import {identity, always} from 'ramda';
import createSagaMiddleware from 'redux-saga';
import {createStore, applyMiddleware} from 'redux';
import {all, call, put, select} from 'redux-saga/effects';
import {createAsyncAction, idOfAction, isFinished, succeedWith, failWith} from '../action';
import {makeCreateDefaultWorker, takeLatestDeep} from '../saga';

// Notice! See below to know how to mock Date.
// @see https://github.com/facebook/jest/issues/2234
describe('makeCreateDefaultWorker', () => {
    const data = 'data';

    const clearType = 'clear';

    const type = 'test';
    const payload = 'hello';

    const action = createAsyncAction(type)(payload);

    const error = new SyntaxError();
    const errorUnknown = new Error();

    const asyncResolve = jest.fn(() => Promise.resolve(data));
    const asyncReject = jest.fn(() => Promise.reject(error));
    const asyncRejectUnknown = jest.fn(() => Promise.reject(errorUnknown));

    it('should let the worker return immediatly if the action is already finished', () => {
        const createWorker = makeCreateDefaultWorker();

        const worker = createWorker(asyncResolve);

        const run = worker(succeedWith('anything')(action));

        expect(run.next().done).toBe(true);
        expect(run.next().value).toBe(undefined);
    });

    it('should let the worker throw on the error, if the error should not catch.', () => {
        const options = {
            shouldCatch: always(false),
            cleanupActionType: clearType,
        };

        const createWorker = makeCreateDefaultWorker(options);

        const worker = createWorker(asyncRejectUnknown);

        const run = worker(action);

        expect(run.next().value).toEqual(select());
        expect(run.next().value).toEqual(call(asyncRejectUnknown, action.payload));
        expect(() => run.throw(new Error()).value).toThrowError(Error);
    });

    it([
        'should let the worker dispatch a failed action, ',
        'if the error matches the specified error type,',
        'then return.',
    ].join(''), () => {
        const options = {
            shouldCatch: always(true),
            cleanupActionType: clearType,
        };

        const createWorker = makeCreateDefaultWorker(options);

        const theDate = Date;
        const now = new Date();

        global.Date = jest.fn(() => now);

        const worker = createWorker(asyncReject);

        const run = worker(action);

        expect(run.next().value).toEqual(select());
        expect(run.next().value).toEqual(call(asyncReject, action.payload));
        expect(run.throw(error).value).toEqual(put(failWith(error)(action)));
        expect(run.next().done).toBe(true);
        expect(run.next().value).toBe(undefined);

        global.Date = theDate;
    });

    it([
        'should let the worker dispatch a finished action,',
        'then dispatch cleaup action',
        'if "autoclear" is defined "true" for the creator only',
    ].join(''), () => {
        const options = {
            shouldCatch: always(false),
            cleanupActionType: clearType,
            autoclear: true,
        };

        const createWorker = makeCreateDefaultWorker(options);

        const theDate = Date;
        const now = new Date();

        global.Date = jest.fn(() => now);

        const worker = createWorker(asyncResolve);

        const run = worker(action);

        expect(run.next().value).toEqual(select());
        expect(run.next().value).toEqual(call(asyncResolve, action.payload));
        expect(run.next(data).value).toEqual(put(succeedWith(data)(action)));
        expect(run.next().value).toEqual(put({type: clearType, payload: idOfAction(action)}));
        expect(run.next().value).toEqual(undefined);

        global.Date = theDate;
    });

    it([
        'should let the worker dispatch a finished action,',
        'then dispatch cleaup action',
        'if "autoclear" is defined "true" for the worker only',
    ].join(''), () => {
        const options = {
            shouldCatch: always(false),
            cleanupActionType: clearType,
            autoclear: false,
        };

        const createWorker = makeCreateDefaultWorker(options);

        const theDate = Date;
        const now = new Date();

        global.Date = jest.fn(() => now);

        const worker = createWorker(asyncResolve, undefined, {autoclear: true});

        const run = worker(action);

        expect(run.next().value).toEqual(select());
        expect(run.next().value).toEqual(call(asyncResolve, action.payload));
        expect(run.next(data).value).toEqual(put(succeedWith(data)(action)));
        expect(run.next().value).toEqual(put({type: clearType, payload: idOfAction(action)}));
        expect(run.next().value).toEqual(undefined);

        global.Date = theDate;
    });

    it([
        'should let the worker dispatch a finished action,',
        'without dispatching cleaup action',
        'if "autoclear" is defined "false" for the worker, ',
        'but "true" for the worker creator',
    ].join(''), () => {
        const options = {
            shouldCatch: always(false),
            cleanupActionType: clearType,
            autoclear: true,
        };

        const createWorker = makeCreateDefaultWorker(options);

        const theDate = Date;
        const now = new Date();

        global.Date = jest.fn(() => now);

        const worker = createWorker(asyncResolve, undefined, {autoclear: false});

        const run = worker(action);

        expect(run.next().value).toEqual(select());
        expect(run.next().value).toEqual(call(asyncResolve, action.payload));
        expect(run.next(data).value).toEqual(put(succeedWith(data)(action)));
        expect(run.next().value).toEqual(undefined);

        global.Date = theDate;
    });

    it([
        'should let the worker dispatch a finished action',
        'with calculated payload if provide a function,',
    ].join(''), () => {
        const options = {
            shouldCatch: always(false),
            cleanupActionType: clearType,
            autoclear: false,
        };

        const createWorker = makeCreateDefaultWorker(options);

        const theDate = Date;
        const now = new Date();

        global.Date = jest.fn(() => now);

        const payload = 'any';

        const worker = createWorker(asyncResolve, () => payload);

        const run = worker(action);

        expect(run.next().value).toEqual(select());
        expect(run.next(payload).value).toEqual(call(asyncResolve, payload));
        expect(run.next(data).value).toEqual(put(succeedWith(data)(action)));
        expect(run.next().value).toEqual(undefined);

        global.Date = theDate;
    });
});

describe('takeLatestDeep', () => {
    let count = 0;

    const asyncCall = jest.fn(() => new Promise(resolve => {
        const data = String(++count * 100);
        setTimeout(() => resolve(data), 200);
    }));

    const racingCall = jest.fn(identity);

    const rootReducer = (state = '', action) => {
        if (!isFinished(action) || action.error) {
            return state;
        }
        return action.payload;
    };

    const sagaMiddleware = createSagaMiddleware();

    const store = createStore(rootReducer, undefined, applyMiddleware(sagaMiddleware));

    function* worker(action) {
        if (isFinished(action)) {
            return;
        }

        const result = yield call(asyncCall);

        yield put(succeedWith(racingCall(result))(action));
    }

    function* rootSaga() {
        yield all([takeLatestDeep('type', worker)])
    }

    sagaMiddleware.run(rootSaga);

    it('should take latest only for normal worker saga.', () => {
        const action1 = createAsyncAction('type')('args');
        const action2 = createAsyncAction('type')('args');

        store.dispatch(action1);
        store.dispatch(action2);

        return new Promise(resolve => {
            setTimeout(() => {
                expect(racingCall).toHaveBeenCalledTimes(1);
                expect(store.getState()).toBe('200');
                resolve();
            }, 300);
        })
    });
});
