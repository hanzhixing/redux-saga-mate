function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

import React from 'react';
import { compose, withProps, withStateHandlers, renderComponent, wrapDisplayName } from 'recompose';
import identity from 'ramda/src/identity';
import set from 'ramda/src/set';
import lensPath from 'ramda/src/lensPath';
var withStates = withStateHandlers(function () {
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
});
export var withAsyncActionStateHandler = function withAsyncActionStateHandler() {
  var mapToProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : identity;
  return compose(withStates, withProps(mapToProps));
};
export var createAsyncActionContext = function createAsyncActionContext() {
  var _React$createContext = React.createContext(undefined),
      Provider = _React$createContext.Provider,
      Consumer = _React$createContext.Consumer;

  var withAsyncActionContextProvider = function withAsyncActionContextProvider(ComponentIn) {
    var ComponentOut = function ComponentOut(_ref) {
      var actionIds = _ref.actionIds,
          setActionId = _ref.setActionId,
          unsetActionId = _ref.unsetActionId,
          rest = _objectWithoutProperties(_ref, ["actionIds", "setActionId", "unsetActionId"]);

      return React.createElement(Provider, {
        value: {
          actionIds: actionIds,
          setActionId: setActionId,
          unsetActionId: unsetActionId
        }
      }, React.createElement(ComponentIn, rest));
    };

    ComponentOut.displayName = wrapDisplayName(ComponentIn, 'withAsyncActionContextProvider');
    return withStates(ComponentOut);
  };

  var withAsyncActionContextConsumer = function withAsyncActionContextConsumer(ComponentIn) {
    var ComponentOut = function ComponentOut(props) {
      return React.createElement(Consumer, null, function (context) {
        return React.createElement(ComponentIn, _objectSpread({}, props, context));
      });
    };

    ComponentOut.displayName = wrapDisplayName(ComponentIn, 'withAsyncActionContextConsumer');
    return ComponentOut;
  };

  return {
    withAsyncActionContextProvider: withAsyncActionContextProvider,
    withAsyncActionContextConsumer: withAsyncActionContextConsumer
  };
};