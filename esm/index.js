import { createAsyncAction, makeActionAsync, idOfAction, isFinished, continueWith, succeedWith, failWith } from './action';
import { withAsyncActionStateHandler, createAsyncActionContext } from './hoc';
import { UPDATE, DELETE } from './operation';
import { createActionsReducer, createEntitiesReducer, groupByComposeByEntityType } from './reducer';
import { makeCreateDefaultWorker } from './saga';
import { createSelectActions } from './selector';
export default {
  createAsyncAction: createAsyncAction,
  makeActionAsync: makeActionAsync,
  idOfAction: idOfAction,
  isFinished: isFinished,
  continueWith: continueWith,
  succeedWith: succeedWith,
  failWith: failWith,
  withAsyncActionStateHandler: withAsyncActionStateHandler,
  createAsyncActionContext: createAsyncActionContext,
  Operations: {
    UPDATE: UPDATE,
    DELETE: DELETE
  },
  createActionsReducer: createActionsReducer,
  createEntitiesReducer: createEntitiesReducer,
  groupByComposeByEntityType: groupByComposeByEntityType,
  makeCreateDefaultWorker: makeCreateDefaultWorker,
  createSelectActions: createSelectActions
};