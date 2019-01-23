import { createAsyncAction, makeActionAsync, idOfAction, isFinished, continueWith, succeedWith, failWith } from './action';
import { withAsyncActionTrack } from './hoc';
import { UPDATE, DELETE } from './operation';
import { createActionsReducer, createEntitiesReducer, groupByComposeByEntityType } from './reducer';
import { makeCreateDefaultWorker } from './saga';
import { selectActions } from './selector';
export default {
  createAsyncAction: createAsyncAction,
  makeActionAsync: makeActionAsync,
  idOfAction: idOfAction,
  isFinished: isFinished,
  continueWith: continueWith,
  succeedWith: succeedWith,
  failWith: failWith,
  withAsyncActionTrack: withAsyncActionTrack,
  Operations: {
    UPDATE: UPDATE,
    DELETE: DELETE
  },
  createActionsReducer: createActionsReducer,
  createEntitiesReducer: createEntitiesReducer,
  groupByComposeByEntityType: groupByComposeByEntityType,
  makeCreateDefaultWorker: makeCreateDefaultWorker,
  selectActions: selectActions
};