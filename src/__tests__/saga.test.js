import {call, put, select} from 'redux-saga/effects';
import {createAction} from 'redux-actions';
import {createAsyncAction, idOfAction, succeedWith, failWith} from '../action';
import {makeCreateDefaultWorker} from '../saga';

const REGEX_ISO8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

// Notice! See below to know how to mock Date.
// @see https://github.com/facebook/jest/issues/2234
describe('makeCreateDefaultWorker', () => {
    const data = 'data';

    const clearType = 'clear';

    const createWorker = makeCreateDefaultWorker([SyntaxError, clearType]);

    const type = 'test';
    const payload = 'hello';

    const action = createAsyncAction(type)(payload);

    const error = new SyntaxError();
    const errorUnknown = new Error();

    const asyncResolve = jest.fn(() => Promise.resolve(data));
    const asyncReject = jest.fn(() => Promise.reject(error));
    const asyncRejectUnknown = jest.fn(() => Promise.reject(errorUnknown));

    it('should let the worker return immediatly if the action is already finished', () => {
        const worker = createWorker(asyncResolve);

        const run = worker(succeedWith('anything')(action));

        expect(run.next().done).toBe(true);
        expect(run.next().value).toBe(undefined);
    });

    it('should let the worker throw on the error, if the error is unknown type.', () => {
        const worker = createWorker(asyncRejectUnknown);

        const run = worker(action);

        expect(run.next().value).toEqual(select());
        expect(run.next().value).toEqual(call(asyncRejectUnknown, action.payload));
        expect(() => run.throw(new Error()).value).toThrowError(Error);
    });

    it([
        'should let the worker dispatch a failed action',
        'if the error matches the specified error type,',
        'then return.'
    ].join(''), () => {
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
        'then dispatch cleaup action'
    ].join(''), () => {
        const theDate = Date;
        const now = new Date();
        global.Date = jest.fn(() => now);

        const worker = createWorker(asyncResolve);

        const run = worker(action);

        expect(run.next().value).toEqual(select());
        expect(run.next().value).toEqual(call(asyncResolve, action.payload));
        expect(run.next(data).value).toEqual(put(succeedWith(data)(action)));
        expect(run.next().value).toEqual(put(createAction(clearType)(idOfAction(action))));

        global.Date = theDate;
    });

    it([
        'should let the worker dispatch a finished action',
        'with calculated payload if provide a function,',
        'then dispatch cleaup action'
    ].join(''), () => {
        const theDate = Date;
        const now = new Date();
        global.Date = jest.fn(() => now);

        const payload = 'any';
        const worker = createWorker(asyncResolve, (state, action) => payload);

        const run = worker(action);

        expect(run.next().value).toEqual(select());
        expect(run.next(payload).value).toEqual(call(asyncResolve, payload));
        expect(run.next(data).value).toEqual(put(succeedWith(data)(action)));
        expect(run.next().value).toEqual(put(createAction(clearType)(idOfAction(action))));

        global.Date = theDate;
    });
});
