import {pathEq} from 'ramda';
import {isPlainObject} from 'is-plain-object';
import stringify from 'json-stable-stringify';
import {v4 as uuidv4, v5 as uuidv5} from 'uuid';
import {PHASE_STARTED, PHASE_RUNNING, PHASE_FINISH} from './phase';
import {SIGN} from './sign';

const UUID_NULL = '00000000-0000-0000-0000-000000000000';

const UUID_NAMESPACE = uuidv5(document.domain, UUID_NULL);

const TOP_LEVEL_KEYS = ['type', 'payload', 'error', 'meta'];

const META_KEYS = ['sign', 'id', 'pid', 'phase', 'progress', 'ctime', 'utime', 'uniq', 'async'];

const generateInvalidActionErrorMessage = action => (
    `Invalid ReduxSagaMateAction. ${JSON.stringify(action)}`
);

export const isReduxSagaMateAction = action => {
    if (!isPlainObject(action)) {
        return false;
    }

    if (typeof action.type !== 'string') {
        return false;
    }

    if (!Object.keys(action).every(k => TOP_LEVEL_KEYS.includes(k))) {
        return false;
    }

    if (action.meta) {
        if (!isPlainObject(action.meta)) {
            return false;
        }

        if (!Object.keys(action.meta).every(k => META_KEYS.includes(k))) {
            return false;
        }
    }

    return true;
};

export const idOfAction = (action, uniq = false) => {
    if (!isReduxSagaMateAction(action)) {
        throw new Error(generateInvalidActionErrorMessage(action));
    }

    const {type, payload, meta} = action;

    if (meta && meta.id) {
        return meta.id;
    }

    if (uniq) {
        return uuidv4();
    }

    const signal = [type, payload];

    return uuidv5(stringify(signal), UUID_NAMESPACE);
};

export const pidOfAction = action => {
    if (!isReduxSagaMateAction(action)) {
        throw new Error(generateInvalidActionErrorMessage(action));
    }

    const {meta} = action;

    return meta ? meta.pid : undefined;
};

export const trackFor = parent => child => {
    if (!isReduxSagaMateAction(parent)) {
        throw new Error(generateInvalidActionErrorMessage(parent));
    }

    if (!isReduxSagaMateAction(child)) {
        throw new Error(generateInvalidActionErrorMessage(child));
    }

    return {
        ...child,
        meta: {
            id: idOfAction(child),
            pid: idOfAction(parent),
            ctime: (new Date()).toISOString(),
        },
    };
};

export const isAsync = pathEq(['meta', 'async'], true);
export const isUnique = pathEq(['meta', 'uniq'], true);
export const isStarted = pathEq(['meta', 'phase'], PHASE_STARTED);
export const isRunning = pathEq(['meta', 'phase'], PHASE_RUNNING);
export const isFinished = pathEq(['meta', 'phase'], PHASE_FINISH);

export const continueWith = (payload, progress = 0) => action => {
    if (!isReduxSagaMateAction(action)) {
        throw new Error(generateInvalidActionErrorMessage(action));
    }

    return {
        ...action,
        payload,
        meta: {
            ...action.meta,
            phase: PHASE_RUNNING,
            progress,
            utime: (new Date()).toISOString(),
        },
    };
};

export const succeedWith = payload => action => {
    if (!isReduxSagaMateAction(action)) {
        throw new Error(generateInvalidActionErrorMessage(action));
    }

    return {
        ...action,
        payload,
        meta: {
            ...action.meta,
            phase: PHASE_FINISH,
            progress: 100,
            utime: (new Date()).toISOString(),
        },
    };
};

export const failWith = error => action => {
    if (!isReduxSagaMateAction(action)) {
        throw new Error(generateInvalidActionErrorMessage(action));
    }

    return {
        ...action,
        payload: error,
        error: true,
        meta: {
            ...action.meta,
            phase: PHASE_FINISH,
            progress: 100,
            utime: (new Date()).toISOString(),
        },
    };
};

export const isChildOf = parent => child => {
    if (!isReduxSagaMateAction(parent)) {
        throw new Error(generateInvalidActionErrorMessage(parent));
    }

    if (!isReduxSagaMateAction(child)) {
        throw new Error(generateInvalidActionErrorMessage(child));
    }

    return (parent.meta.id === child.meta.pid);
};

export const makeChildOf = parent => child => {
    if (!isReduxSagaMateAction(parent)) {
        throw new Error(generateInvalidActionErrorMessage(parent));
    }

    if (!isReduxSagaMateAction(child)) {
        throw new Error(generateInvalidActionErrorMessage(child));
    }

    const childAction = trackFor(parent)(child);

    return {
        ...childAction,
        meta: {
            ...childAction.meta,
            phase: PHASE_STARTED,
            progress: 0,
        },
    };
};

const defaultOptions = {
    uniq: false,
    async: true,
};

export const createTrackableAction = (action, {uniq = false, async = true} = defaultOptions) => {
    if (!isReduxSagaMateAction(action)) {
        throw new Error(generateInvalidActionErrorMessage(action));
    }

    return {
        ...action,
        meta: {
            sign: SIGN,
            id: idOfAction(action, uniq),
            pid: undefined,
            phase: PHASE_STARTED,
            progress: 0,
            ctime: (new Date()).toISOString(),
            uniq,
            async,
        },
    };
};

export const createAsyncAction = type => payload => (
    createTrackableAction({type, payload})
);

export const createAsyncActionUnique = type => payload => (
    createTrackableAction({type, payload}, {uniq: true})
);
