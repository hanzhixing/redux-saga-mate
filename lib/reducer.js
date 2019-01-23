function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

import Errio from 'errio';
import compose from 'ramda/src/compose';
import omit from 'ramda/src/omit';
import mergeDeepWithKey from 'ramda/src/mergeDeepWithKey';
import mergeDeepRight from 'ramda/src/mergeDeepRight';
import mergeWith from 'ramda/src/mergeWith';
import keys from 'ramda/src/keys';
import reduce from 'ramda/src/reduce';
import uniq from 'ramda/src/uniq';
import flatten from 'ramda/src/flatten';
import map from 'ramda/src/map';
import set from 'ramda/src/set';
import lensProp from 'ramda/src/lensProp';
import { isFinished } from './action';
import { UPDATE, DELETE } from './operation';
var DEFAULT_CLEANUP_ACTION_TYPE = 'CLEANUP_TRACKABLE_ACTION';
var DEFAULT_ASYNC_ACTION_TYPE_REGEX = /^(REST|API|LOAD|ASYNC|FETCH|AJAX)_[0-9A-Z_]+$/;
export var createActionsReducer = function createActionsReducer() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [DEFAULT_CLEANUP_ACTION_TYPE, DEFAULT_ASYNC_ACTION_TYPE_REGEX],
      _ref2 = _slicedToArray(_ref, 2),
      CleanupActionType = _ref2[0],
      AsyncActionTypeRegex = _ref2[1];

  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments.length > 1 ? arguments[1] : undefined;

    if (action.type === CleanupActionType) {
      return Array.isArray(action.payload) ? omit(action.payload, state) : omit([action.payload], state);
    }

    if (AsyncActionTypeRegex.test(action.type)) {
      return set(lensProp(action.meta.id), mergeDeepRight(action, {
        payload: action.error ? JSON.parse(Errio.stringify(action.payload)) : action.payload
      }), state);
    }

    return state;
  };
};
export var createEntityTypeReducer = function createEntityTypeReducer(entityType, operations) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments.length > 1 ? arguments[1] : undefined;

    if (operations[action.type] && isFinished(action) && !action.error) {
      var _ref3 = Array.isArray(operations[action.type]) ? operations[action.type] : [operations[action.type]],
          _ref4 = _slicedToArray(_ref3, 2),
          operation = _ref4[0],
          merger = _ref4[1];

      if (operation === UPDATE) {
        var getNewPayload = function getNewPayload() {
          if (action.payload.response) {
            return action.payload.response.entities[entityType];
          }

          return action.payload.entities[entityType];
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
};
export var createEntitiesReducer = function createEntitiesReducer(entityActionMap) {
  return compose(reduce(function (reducers, entityType) {
    return set(lensProp(entityType), createEntityTypeReducer(entityType, entityActionMap[entityType]), reducers);
  }, {}), keys)(entityActionMap);
};
/**
 * [{key1: fn1}, {key1: fn11}, {key2: fn2}, {key2: fn22, key3: fn3}]
 * =>
 * {key1: [fn1, fn11], key2: [fn2, fn22], key3: [fn3]}
 */

export var groupByComposeByEntityType = function groupByComposeByEntityType() {
  for (var _len = arguments.length, combinedReducers = new Array(_len), _key = 0; _key < _len; _key++) {
    combinedReducers[_key] = arguments[_key];
  }

  var entityTypes = compose(uniq, flatten, map(keys))(combinedReducers);
  var queuedCombinedReducers = reduce(function (newCombined, entityType) {
    return set(lensProp(entityType), reduce(function (queue, combined) {
      return combined[entityType] ? queue.concat([combined[entityType]]) : queue;
    }, [], combinedReducers), newCombined);
  }, {}, entityTypes);
  var mergeQueuedReducers = compose(reduce(function (acc, cur) {
    return set(lensProp(cur), reduce(function (final, reducer) {
      return function (state, action) {
        return reducer(final(state, action), action);
      };
    }, function (v) {
      return v;
    }, queuedCombinedReducers[cur]), acc);
  }, {}), keys);
  return mergeQueuedReducers(queuedCombinedReducers);
};