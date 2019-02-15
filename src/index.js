import {createAsyncAction, makeActionAsync, idOfAction, isFinished, continueWith, succeedWith, failWith} from './action';
import {withAsyncActionStateHandler} from './hoc';
import {UPDATE, DELETE} from './operation';
import {createActionsReducer, createEntitiesReducer, groupByComposeByEntityType} from './reducer';
import {makeCreateDefaultWorker} from './saga';
import {createSelectActions} from './selector';

export default {
    createAsyncAction,
    makeActionAsync,
    idOfAction,
    isFinished,
    continueWith,
    succeedWith,
    failWith,
    withAsyncActionStateHandler,
    Operations: {
        UPDATE,
        DELETE,
    },
    createActionsReducer,
    createEntitiesReducer,
    groupByComposeByEntityType,
    makeCreateDefaultWorker,
    createSelectActions,
};
