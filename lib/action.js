function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import stringify from 'json-stable-stringify';
import { createAction } from 'redux-actions';
import { isFSA } from 'flux-standard-action';
import set from 'ramda/src/set';
import lensProp from 'ramda/src/lensProp';
import lensPath from 'ramda/src/lensPath';
import omit from 'ramda/src/omit';
import uuidv4 from 'uuid/v4';
import uuidv5 from 'uuid/v5';
import { FluxStandardActionError } from './error';
import { PHASE_GHOST, PHASE_WAITING, PHASE_RUNNING, PHASE_FINISH } from './phase';
var UUID_NAMESPACE = uuidv4();
export var idOfAction = function idOfAction(action) {
  if (!isFSA(action)) {
    throw new FluxStandardActionError();
  }

  var type = action.type,
      payload = action.payload,
      meta = action.meta;

  if (meta && meta.id) {
    return meta.id;
  }

  return uuidv5(stringify([type, payload]), UUID_NAMESPACE);
};
export var pidOfAction = function pidOfAction(action) {
  if (!isFSA(action)) {
    throw new FluxStandardActionError();
  }

  var _action$meta = action.meta,
      meta = _action$meta === void 0 ? {} : _action$meta;
  return meta.pid;
};
export var makeTrackable = function makeTrackable(action) {
  if (!isFSA(action)) {
    throw new FluxStandardActionError();
  }

  return _objectSpread({}, action, {
    meta: {
      id: idOfAction(action),
      pid: undefined,
      ctime: new Date().toISOString()
    }
  });
};
export var trackFor = function trackFor(parent) {
  return function (child) {
    if (!isFSA(child) || !isFSA(parent)) {
      throw new FluxStandardActionError();
    }

    return _objectSpread({}, child, {
      meta: {
        id: idOfAction(child),
        pid: idOfAction(parent),
        ctime: new Date().toISOString()
      }
    });
  };
};
export var isWaiting = function isWaiting(action) {
  return action.meta.phase === PHASE_WAITING;
};
export var isRunning = function isRunning(action) {
  return action.meta.phase === PHASE_RUNNING;
};
export var isFinished = function isFinished(action) {
  return action.meta.phase === PHASE_FINISH;
};
export var continueWith = function continueWith(payload) {
  var progress = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return function (action) {
    if (!isFSA(action)) {
      throw new FluxStandardActionError();
    }

    return _objectSpread({}, action, {
      payload: payload,
      meta: _objectSpread({}, action.meta, {
        phase: PHASE_RUNNING,
        progress: progress,
        utime: new Date().toISOString()
      })
    });
  };
};
export var succeedWith = function succeedWith(payload) {
  return function (action) {
    if (!isFSA(action)) {
      throw new FluxStandardActionError();
    }

    return _objectSpread({}, action, {
      payload: payload,
      meta: _objectSpread({}, action.meta, {
        phase: PHASE_FINISH,
        progress: 100,
        utime: new Date().toISOString()
      })
    });
  };
};
export var failWith = function failWith(error) {
  return function (action) {
    if (!isFSA(action)) {
      throw new FluxStandardActionError();
    }

    return _objectSpread({}, action, {
      payload: error,
      error: true,
      meta: _objectSpread({}, action.meta, {
        phase: PHASE_FINISH,
        progress: 100,
        utime: new Date().toISOString()
      })
    });
  };
};
export var isChildOf = function isChildOf(parent) {
  return function (child) {
    if (!isFSA(child) || !isFSA(parent)) {
      throw new FluxStandardActionError();
    }

    return parent.meta.id === child.meta.pid;
  };
};
export var makeChildOf = function makeChildOf(parent) {
  return function (child) {
    if (!isFSA(child) || !isFSA(parent)) {
      throw new FluxStandardActionError();
    }

    var childAction = trackFor(parent)(child);
    return _objectSpread({}, childAction, {
      meta: _objectSpread({}, childAction.meta, {
        phase: PHASE_WAITING,
        progress: 0
      })
    });
  };
};
export var makeActionAsync = function makeActionAsync(action) {
  if (!isFSA(action)) {
    throw new FluxStandardActionError();
  }

  var trackableAction = makeTrackable(action);
  return _objectSpread({}, trackableAction, {
    meta: _objectSpread({}, trackableAction.meta, {
      phase: PHASE_WAITING,
      progress: 0
    })
  });
};
export var createAsyncAction = function createAsyncAction(type) {
  return function (payload) {
    return makeActionAsync(createAction(type)(payload));
  };
};