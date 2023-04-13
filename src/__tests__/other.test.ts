import {identity} from 'ramda';
import {noop} from 'ramda-adjunct';
import {configureStore} from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import {call, put, CallEffect, PutEffect} from 'redux-saga/effects';
import {createAsyncAction, isFinished, succeedWith, AsyncAction} from 'redux-hyper-action';
import {
    createEntitiesReducer,
    groupByComposeByEntityType,
    takeLatestDeep,
    OperationLocatorsMap,
    EntityActionMap,
    ReducerMap,
} from '../index';

const UPDATE = 'UPDATE';
const DELETE = 'DELETE';

describe('createEntitiesReducer', () => {
    const locators: OperationLocatorsMap = {
        UPDATE: [
            ['entities'],
        ],
        DELETE: [
            ['delete'],
        ],
    };

    const ENTITY_ACTION_MAP: EntityActionMap = {
        foo: {
            act1: UPDATE,
            act2: DELETE,
        },
        bar: {
            act3: UPDATE,
        },
    };

    const reducer = createEntitiesReducer(locators, ENTITY_ACTION_MAP);

    it('create object of which every property maps string key to a function', () => {
        expect(Object.keys(reducer)).toEqual(['foo', 'bar']);
        expect(Object.values(reducer).map(v => (typeof v))).toEqual(['function', 'function']);
    });
});

describe('groupByComposeByEntityType', () => {
    const fn1 = jest.fn(noop);
    const fn2 = jest.fn(noop);
    const fn3 = jest.fn(noop);
    const fn4 = jest.fn(noop);
    const fn5 = jest.fn(noop);

    const args: ReducerMap[] = [
        {key1: fn1},
        {key1: fn2},
        {key2: fn3},
        {key2: fn4, key3: fn5},
    ];

    const reducer = groupByComposeByEntityType(...args);

    it('should be abled to group passed objects by the object keys', () => {
        expect(Object.keys(reducer)).toEqual(['key1', 'key2', 'key3']);
    });

    it('should call reducer functions in order with same key', () => {
        reducer.key1(undefined, undefined);
        expect(fn1).toHaveBeenCalledBefore(fn2);

        reducer.key2(undefined, undefined);
        expect(fn3).toHaveBeenCalledBefore(fn4);

        reducer.key3(undefined, undefined);
        expect(fn5).toHaveBeenCalledTimes(1);
    });
});

describe('takeLatestDeep', () => {
    let count = 0;

    const asyncCall = jest.fn(() => new Promise(resolve => {
        const data = String(++count * 100);
        setTimeout(() => resolve(data), 200);
    }));

    const racingCall = jest.fn(identity);

    const rootReducer = (state = '', action: AsyncAction): any => {
        if (!isFinished(action) || action.error) {
            return state;
        }
        return action.payload;
    };

    const sagaMiddleware = createSagaMiddleware()
    const middleware = [sagaMiddleware]

    const store = configureStore({
        reducer: rootReducer,
        middleware: getDefaultMiddleware => getDefaultMiddleware().concat(middleware),
    })

    function* worker(action: AsyncAction): Generator<CallEffect | PutEffect> {
        if (isFinished(action)) {
            return;
        }

        const result = yield call(asyncCall);

        yield put(succeedWith(racingCall(result))(action));
    }

    function* rootSaga() {
        yield takeLatestDeep('type', worker);
    }

    sagaMiddleware.run(rootSaga);

    it('should take the latest only for normal worker saga.', () => {
        const action1 = createAsyncAction('type', 'args');
        const action2 = createAsyncAction('type', 'args');

        store.dispatch(action1);
        store.dispatch(action2);

        return new Promise(resolve => {
            setTimeout(() => {
                expect(racingCall).toHaveBeenCalledTimes(1);
                expect(store.getState()).toBe('200');
                resolve(undefined);
            }, 300);
        })
    });
});
