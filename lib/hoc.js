function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

import { withStateHandlers } from 'recompose';
import set from 'ramda/src/set';
import lensPath from 'ramda/src/lensPath';
export var withAsyncActionTrack = withStateHandlers(function () {
  return {
    actionIds: {}
  };
}, {
  onTrackAsyncAction: function onTrackAsyncAction(state, props) {
    return function (key, actionId) {
      var lens = Array.isArray(key) ? lensPath(['actionIds'].concat(_toConsumableArray(key))) : lensPath(['actionIds', key]);
      return set(lens, actionId, state);
    };
  },
  onUntrackAsyncAction: function onUntrackAsyncAction(state, props) {
    return function (key) {
      var lens = Array.isArray(key) ? lensPath(['actionIds'].concat(_toConsumableArray(key))) : lensPath(['actionIds', key]);
      return set(lens, undefined, state);
    };
  }
});