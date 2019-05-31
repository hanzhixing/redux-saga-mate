import {UPDATE, DELETE} from './operation';

export {
    createAsyncAction,
    makeActionAsync,
    idOfAction,
    isFinished,
    continueWith,
    succeedWith,
    failWith,
} from './action';

export {
    createActionsReducer,
    createEntitiesReducer,
    groupByComposeByEntityType,
} from './reducer';

export {
    withAsyncActionStateHandler,
    createAsyncActionContext,
} from './hoc';

export {makeCreateDefaultWorker} from './saga';

export {createSelectActions} from './selector';

export {UPDATE, DELETE};

export const EntityOperations = {UPDATE, DELETE};
