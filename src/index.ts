import {isPlainObject} from 'is-plain-object';
import {
    always,
    append,
    assoc,
    compose,
    flatten,
    identity,
    keys,
    map,
    mergeDeepRight,
    omit,
    path,
    reduce,
    uniq,
} from 'ramda';
import {AnyAction, Reducer, combineReducers} from '@reduxjs/toolkit';
import type {PlainValue} from 'plainp';
import {
    failWith,
    idOfAction,
    isAsync,
    isFinished,
    isValidAction,
    succeedWith,
    Payload,
    HyperAction,
    AsyncAction,
} from 'redux-hyper-action';
import {call, cancel, fork, put, select, take} from 'redux-saga/effects';

export type CreateActionsReducerParam = {
    shouldCleanup?: (action: AnyAction) => boolean;
    shouldTrack?: (action: AnyAction) => boolean;
};

const isStringArray = (o: unknown): o is string[] => (
    Array.isArray(o) && o.every(v => typeof v === 'string')
);

// {
//     [$actionId]: {
//         ...action,
//     },
// },
export const createActionsReducer = ({
    shouldCleanup = always(false),
    shouldTrack = always(false),
}: CreateActionsReducerParam = {}) => <T extends string, P extends Payload>(
    state: PlainValue = {},
    action: HyperAction<T, P>,
): PlainValue => {
    // do nothing and keep the state as is, if the action is not a valid Redux Hyper Action
    if (!isValidAction(action)) {
        return state;
    }

    // remove action state by id
    if (shouldCleanup(action)) {
        const errmsg = 'Payload of clean-up actions must be a string or array of string! <redux-saga-mate>';

        if (!isStringArray(action.payload) && typeof action.payload !== 'string') {
            throw new Error(errmsg);
        }

        const actionIds = Array.isArray(action.payload) ? action.payload : [action.payload];

        return omit(actionIds as string[], state);
    }

    if (shouldTrack(action)) {
        return assoc(action.meta.id, action, state);
    }

    return state;
};

// {
//     // define possible paths to entities in your action payload
//     UPDATE: [
//         ['response', 'entities'],
//         ['entities'],
//     ],
//     // paths to primaryKey in your action payload, which will be used to delete the entity
//     DELETE: [
//         ['request', 'params', 'id'],
//     ],
// }
export type OperationPayloadLocator = string[];

export type EntityOperation = 'UPDATE' | 'DELETE' | 'REPLACE';

export type OperationLocatorsMap = {
    [k in EntityOperation]?: OperationPayloadLocator[];
};

export type EntityReducer = (state: any, action: any) => any;

export type ActionOperationMap = {
    [k: string]: EntityOperation | EntityReducer;
};

const isSerializablePrimaryType = (o: unknown) => (
    ['undefined', 'null', 'string', 'number', 'boolean'].includes(typeof o)
);

export const createEntityTypeReducer = <E extends string>(
    locators: OperationLocatorsMap,
    entityType: E,
    operations: ActionOperationMap,
) => <S extends PlainValue, T extends string, P extends Payload>(
    state: S = {} as S,
    action: HyperAction<T, P>,
): S => {
    if (!operations[action.type]) {
        return state;
    }

    if (isAsync(action) && (!isFinished(action as AsyncAction) || action.error)) {
        return state;
    }

    const operation = operations[action.type];

    if (typeof operation === 'function') {
        return operation(state, action);
    }

    const locator = (locators[operation] || []).find(v => path(v, action.payload));

    if (!locator) {
        return state;
    }

    if (operation === 'DELETE') {
        const payload = path(locator, action.payload);

        const actionIds = Array.isArray(payload) ? payload : [payload];

        return omit(actionIds, state) as S;
    }

    const entities = path([...locator, entityType], action.payload);

    if (!entities) {
        return state;
    }

    if (operation === 'REPLACE') {
        return entities as S;
    }

    if (operation === 'UPDATE') {
        if (isSerializablePrimaryType(state)) {
            return entities as S;
        }

        if (isPlainObject(state)) {
            return mergeDeepRight(state, entities) as S;
        }
    }

    return state;
};

export type EntityActionMap = {
    [k: string]: ActionOperationMap;
};

export type EntitiesReducer = {
    [k: string]: ReturnType<typeof createEntityTypeReducer>;
};

export const createEntitiesReducer = (
    locators: OperationLocatorsMap,
    entityActionMap: EntityActionMap,
): EntitiesReducer => compose(
    reduce((reducers, entityType) => assoc(
        entityType,
        createEntityTypeReducer(locators, entityType, entityActionMap[entityType]),
        reducers,
    ), {}),
    keys,
)(entityActionMap);

export type ReducerMap = Parameters<typeof combineReducers>[0];

export type ReducerListMap = {
    [k: string]: Reducer[];
};

// input: [{key1: fn1}, {key1: fn11}, {key2: fn2}, {key2: fn22, key3: fn3}]
export const groupByComposeByEntityType = (...reducerMap: ReducerMap[]): ReducerMap => {
    const entityTypes = compose(uniq, flatten<string[][]>, map(keys))(reducerMap as ReducerMap[]);

    const collectReducersByEntityType = (entityType: string) => reduce(
        (acc, cur) => (cur[entityType] ? append(cur[entityType], acc) : acc),
        [] as Reducer[],
        reducerMap,
    );

    // genertates: {key1: [fn1, fn11], key2: [fn2, fn22], key3: [fn3]}
    const reducerListByEntityType = reduce(
        (acc, cur) => assoc(cur, collectReducersByEntityType(cur), acc),
        {} as ReducerListMap,
        entityTypes,
    );

    // {key1: [fn1, fn2], key2: [fn6, fn7, fn8]}
    //
    // fn1 = (state1, action) => state2;
    // fn2 = (state2, action) => state3;
    // fnX = (state1, action) => fn2(fn1(state1, action);
    //
    // fn6 = (state6, action) => state7;
    // fn7 = (state7, action) => state8;
    // fn8 = (state8, action) => state9;
    // fnY = (state6, action) => fn8(fn7(fn6(state6, action), action), action);
    //
    // {key1: fnX, key2: fnY}
    const nestingReducersByEntityType = (entityType: string) => reduce(
        (acc, cur) => (state, action) => cur(acc(state, action), action),
        identity as Reducer, // start with (state, action) => state,
        reducerListByEntityType[entityType],
    );

    const result = reduce(
        (acc, cur) => assoc(cur, nestingReducersByEntityType(cur), acc),
        {} as ReducerMap,
        entityTypes,
    );

    return result;
};

export type ProcessPayload = <
    T extends string,
    P extends PlainValue,
>(state: PlainValue, action: AsyncAction<T, P>) => PlainValue;

export type MakeCreateDefaultWorker = {
    shouldCatch?: (e: unknown) => boolean;
    parseError?: (e: unknown) => PlainValue;
};

// Sagas and reducers: order of execution
// @see: https://github.com/redux-saga/redux-saga/issues/148
export const makeCreateDefaultWorker = ({
    shouldCatch = always(false),
    parseError = always(undefined),
}: MakeCreateDefaultWorker = {}) => (
    method: (...args: any[]) => any,
    payload: undefined | ProcessPayload = undefined,
) => (function* defaultWorkerSaga<T extends string, P extends PlainValue>(action: AsyncAction<T, P>) {
    try {
        if (isFinished(action)) {
            return;
        }

        const state: PlainValue = yield select();

        const json: PlainValue = yield call(method, (payload ? payload(state, action) : action.payload));

        yield put(succeedWith(json)(action));
    } catch (e) {
        if (typeof shouldCatch === 'function' && shouldCatch(e)) {
            yield put(failWith(parseError(e))(action));
            return;
        }
        throw e;
    }
});

export const takeLatestDeep = <T extends string, P extends PlainValue>(
    pattern: T,
    saga: (...args: any[]) => any,
    ...args: any[]
) => fork(function* () {
    const tasks = new Map<string, unknown>();

    while (true) {
        const action: HyperAction<T, P> = yield take(pattern as string);

        const id = idOfAction(action);

        if (tasks.has(id)) {
            yield cancel(tasks.get(id) as Parameters<typeof cancel>);
        }

        const task = yield fork(saga, ...args.concat(action));

        tasks.set(id, task);
    }
});
