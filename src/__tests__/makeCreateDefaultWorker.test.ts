import {always} from 'ramda';
import {call, put, select} from 'redux-saga/effects';
import {createAsyncAction, succeedWith, failWith} from 'redux-hyper-action';
import {makeCreateDefaultWorker} from '../index';

// Notice! See below to know how to mock Date.
// @see https://github.com/facebook/jest/issues/2234
describe('makeCreateDefaultWorker', () => {
    const GlobalDate = Date;

    beforeAll(() => {
        const now = new Date();

        global.Date = class extends GlobalDate {
            constructor() {
                super(now.getTime());
            }
        } as DateConstructor;
    });

    afterAll(() => {
        global.Date = GlobalDate;
    });

    const data = 'data';

    const type = 'test';

    const payload = 'hello';

    const action = createAsyncAction(type, payload);

    const error = 'error';
    const errorUnknown = 'unknownError';

    const asyncResolve = jest.fn<Promise<string>, any>(() => Promise.resolve(data));
    const asyncReject = jest.fn<Promise<string>, any>(() => Promise.reject(error));
    const asyncRejectUnknown = jest.fn<Promise<string>, any>(() => Promise.reject(errorUnknown));

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
            parseError: always(error),
        };

        const createWorker = makeCreateDefaultWorker(options);

        const worker = createWorker(asyncReject);

        const run = worker(action);

        expect(run.next().value).toEqual(select());
        expect(run.next().value).toEqual(call(asyncReject, action.payload));
        expect(run.throw(error).value).toEqual(put(failWith(error)(action)));
        expect(run.next().done).toBe(true);
        expect(run.next().value).toBe(undefined);
    });

    it([
        'should let the worker dispatch a finished action',
        'with calculated payload if provide a function,',
    ].join(''), () => {
        const options = {
            shouldCatch: always(false),
        };

        const createWorker = makeCreateDefaultWorker(options);

        const payload = 'any';

        const worker = createWorker(asyncResolve, () => payload);

        const run = worker(action);

        expect(run.next().value).toEqual(select());
        expect(run.next(payload).value).toEqual(call(asyncResolve, payload));
        expect(run.next(data).value).toEqual(put(succeedWith(data)(action)));
        expect(run.next().value).toEqual(undefined);
    });
});
