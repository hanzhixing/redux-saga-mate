function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

import { createAction } from 'redux-actions';
import { call, put, select } from 'redux-saga/effects';
import { idOfAction, isFinished, failWith, succeedWith } from './action'; // reducer和saga的执行顺序见下方issue
// @see: https://github.com/redux-saga/redux-saga/issues/148

export var makeCreateDefaultWorker = function makeCreateDefaultWorker(_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      ErrorType = _ref2[0],
      CleanupActionType = _ref2[1];

  return function (method, payload) {
    return (
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(action) {
        var state, json;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;

                if (!isFinished(action)) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt("return");

              case 3:
                _context.next = 5;
                return select();

              case 5:
                state = _context.sent;
                _context.next = 8;
                return call(method, payload ? payload(state, action) : action.payload);

              case 8:
                json = _context.sent;
                _context.next = 11;
                return put(succeedWith(json)(action));

              case 11:
                _context.next = 13;
                return put(createAction(CleanupActionType)(idOfAction(action)));

              case 13:
                _context.next = 22;
                break;

              case 15:
                _context.prev = 15;
                _context.t0 = _context["catch"](0);

                if (!(_context.t0 instanceof ErrorType)) {
                  _context.next = 21;
                  break;
                }

                _context.next = 20;
                return put(failWith(_context.t0)(action));

              case 20:
                return _context.abrupt("return");

              case 21:
                throw _context.t0 instanceof Error ? _context.t0 : new Error(JSON.stringify(_context.t0));

              case 22:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 15]]);
      })
    );
  };
};