import Errio from 'errio';
import compose from 'ramda/src/compose';
import omit from 'ramda/src/omit';
import mergeDeepWithKey from 'ramda/src/mergeDeepWithKey';
import mergeDeepRight from 'ramda/src/mergeDeepRight';
import mergeWith from 'ramda/src/mergeWith';
import keys from 'ramda/src/keys';
import reduce from 'ramda/src/reduce';
import uniq from 'ramda/src/uniq';
import path from 'ramda/src/path';
import flatten from 'ramda/src/flatten';
import map from 'ramda/src/map';
import set from 'ramda/src/set';
import lensProp from 'ramda/src/lensProp';
import {isFinished} from './action';
import {UPDATE, DELETE} from './operation';
import {SIGN} from './sign';

const DEFAULT_CLEANUP_ACTION_TYPE = 'CLEANUP_TRACKABLE_ACTION';
const DEFAULT_ASYNC_ACTION_TYPE_REGEX = /^(REST|API|LOAD|ASYNC|FETCH|AJAX)_[0-9A-Z_]+$/;

export const createActionsReducer = ([
    CleanupActionType,
    AsyncActionTypeRegex,
] = [
    DEFAULT_CLEANUP_ACTION_TYPE,
    DEFAULT_ASYNC_ACTION_TYPE_REGEX,
]) => (state = {}, action) => {
    if (action.type === CleanupActionType) {
        return Array.isArray(action.payload) ? omit(action.payload, state) : omit([action.payload], state);
    }

    // there is nothing we can do without `meta.id`
    if (!action.meta || !action.meta.id) {
        return state;
    }

    if (AsyncActionTypeRegex.test(action.type)) {
        return set(
            lensProp(action.meta.id),
            mergeDeepRight(action, {
                payload: (action.error ? JSON.parse(Errio.stringify(action.payload)) : action.payload),
            }),
            state,
        );
    }

    return state;
};

export const createEntityTypeReducer = (entityType, operations) => (state = {}, action) => {
    if (operations[action.type] && isFinished(action) && !action.error) {
        const [operation, merger] = (
            Array.isArray(operations[action.type]) ? operations[action.type] : [operations[action.type]]
        );
        if (operation === UPDATE) {
            const getNewPayload = () => {
                if (action.payload.response) {
                    return action.payload.response.entities[entityType] || {};
                }
                return action.payload.entities[entityType] || {};
            };
            if (merger) {
                return mergeDeepWithKey(merger, state, getNewPayload());
            }
            return mergeDeepRight(state, getNewPayload());
        }
        if (operation === DELETE) {
            return omit([action.payload.request.params.id])(state);
        }
    }
    return state;
};

export const createEntitiesReducer = entityActionMap => compose(
    reduce((reducers, entityType) => set(
        lensProp(entityType),
        createEntityTypeReducer(entityType, entityActionMap[entityType]),
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
