function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

import { compose, withProps, withStateHandlers } from 'recompose';
import identity from 'ramda/src/identity';
import set from 'ramda/src/set';
import lensPath from 'ramda/src/lensPath';
export var withAsyncActionStateHandler = function withAsyncActionStateHandler() {
  var mapToProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : identity;
  return compose(withStateHandlers(function () {
    return {
      actionIds: {}
    };
  }, {
    setActionId: function setActionId(state, props) {
      return function (key, actionId) {
        var lens = Array.isArray(key) ? lensPath(['actionIds'].concat(_toConsumableArray(key))) : lensPath(['actionIds', key]);
        return set(lens, actionId, state);
      };
    },
    unsetActionId: function unsetActionId(state, props) {
      return function (key) {
        var lens = Array.isArray(key) ? lensPath(['actionIds'].concat(_toConsumableArray(key))) : lensPath(['actionIds', key]);
        return set(lens, undefined, state);
      };
    }
  }), withProps(mapToProps));
};