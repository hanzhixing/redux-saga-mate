import {isPlainObject} from 'is-plain-object';
import {
    compose,
    always,
    omit,
    mergeDeepRight,
    keys,
    reduce,
    uniq,
    path,
    flatten,
    map,
    set,
    lensProp,
} from 'ramda';
import {isAsync, isFinished} from './action';
import {UPDATE, REPLACE, DELETE} from './operation';
import {SIGN} from './sign';

export const createActionsReducer = ({
    shouldCleanup = always(false),
    shouldTrack = always(false),
    parseError = always(undefined),
} = {}) => (state = {}, action) => {
    if (shouldCleanup(action)) {
        return (
            Array.isArray(action.payload) ? omit(action.payload, state) : omit([action.payload], state)
        );
    }

    // there is nothing we can do without correct meta
    if (!isPlainObject(action.meta) || action.meta.sign !== SIGN || !action.meta.id) {
        return state;
    }

    if (shouldTrack(action)) {
        return set(
            lensProp(action.meta.id),
            mergeDeepRight(action, {
                payload: (
                    action.error ? parseError(action.payload) : action.payload
                ),
            }),
            state,
        );
    }

    return state;
};

export const createEntityTypeReducer = (
    locators, entityType, operations,
) => (state = {}, action) => {
    if (!operations[action.type] || (isAsync(action) && (!isFinished(action) || action.error))) {
        return state;
    }

    const operation = operations[action.type];

    if (typeof operation === 'function') {
        return operation(state, action);
    }

    if (!locators[operation]) {
        return state;
    }

    const locator = locators[operation].find(a => path(a, action.payload));

    if (!locator) {
        return state;
    }

    if (operation === DELETE) {
        const pk = path(locator, action.payload);

        return omit(Array.isArray(pk) ? pk : [pk], state);
    }

    const entities = path([...locator, entityType], action.payload);

    if (!entities) {
        return state;
    }

    if (operation === REPLACE) {
        return entities;
    }

    if (operation === UPDATE) {
        return mergeDeepRight(state, entities);
    }

    return state;
};

export const createEntitiesReducer = (locators, entityActionMap) => compose(
    reduce((reducers, entityType) => set(
        lensProp(entityType),
        createEntityTypeReducer(locators, entityType, entityActionMap[entityType]),
        reducers,
    ), {}),
    keys,
)(entityActionMap);

/**
 * [{key1: fn1}, {key1: fn11}, {key2: fn2}, {key2: fn22, key3: fn3}]
 * =>
 * {key1: [fn1, fn11], key2: [fn2, fn22], key3: [fn3]}
 */
export const groupByComposeByEntityType = (...combinedReducers) => {
    const entityTypes = compose(uniq, flatten, map(keys))(combinedReducers);

    const queuedCombinedReducers = reduce(
        (newCombined, entityType) => set(
            lensProp(entityType),
            reduce(
                (queue, combined) => (
                    combined[entityType] ? queue.concat([combined[entityType]]) : queue
                ),
                [],
                combinedReducers,
            ),
            newCombined,
        ),
        {},
        entityTypes,
    );

    const mergeQueuedReducers = compose(
        reduce((acc, cur) => set(
            lensProp(cur),
            reduce(
                (final, reducer) => (state, action) => reducer(final(state, action), action),
                v => v,
                queuedCombinedReducers[cur],
            ),
            acc,
        ), {}),
        keys,
    );

    return mergeQueuedReducers(queuedCombinedReducers);
};
