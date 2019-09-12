/* global document */
import stringify from 'json-stable-stringify';
import {createAction} from 'redux-actions';
import {isFSA} from 'flux-standard-action';
import uuidv5 from 'uuid/v5';
import {FluxStandardActionError} from './error';
import {PHASE_GHOST, PHASE_STARTED, PHASE_RUNNING, PHASE_FINISH} from './phase';
import {SIGN} from './sign';

const UUID_NULL = '00000000-0000-0000-0000-000000000000';

const UUID_NAMESPACE = uuidv5(document.domain, UUID_NULL);

export const idOfAction = (action, uniq = false) => {
    if (!isFSA(action)) {
        throw new FluxStandardActionError();
    }

    const {type, payload, meta} = action;

    if (meta && meta.id) {
        return meta.id;
    }

    const signal = uniq ? [type, payload, Date.now()] : [type, payload];

    return uuidv5(stringify(signal), UUID_NAMESPACE);
};

export const pidOfAction = action => {
    if (!isFSA(action)) {
        throw new FluxStandardActionError();
    }

    const {meta} = action;

    return meta ? meta.pid : undefined;
};

export const makeTrackable = (action, uniq) => {
    if (!isFSA(action)) {
        throw new FluxStandardActionError();
    }

    return {
        ...action,
        meta: {
            id: idOfAction(action, uniq),
            pid: undefined,
            ctime: (new Date()).toISOString(),
            sign: SIGN,
            uniq,
        },
    };
};

export const trackFor = parent => child => {
    if (!isFSA(child) || !isFSA(parent)) {
        throw new FluxStandardActionError();
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

export const isUnique = action => action.meta.uniq === true;
export const isStarted = action => action.meta.phase === PHASE_STARTED;
export const isRunning = action => action.meta.phase === PHASE_RUNNING;
export const isFinished = action => action.meta.phase === PHASE_FINISH;

export const continueWith = (payload, progress = 0) => action => {
    if (!isFSA(action)) {
        throw new FluxStandardActionError();
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
    if (!isFSA(action)) {
        throw new FluxStandardActionError();
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
    if (!isFSA(action)) {
        throw new FluxStandardActionError();
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
    if (!isFSA(child) || !isFSA(parent)) {
        throw new FluxStandardActionError();
    }

    return (parent.meta.id === child.meta.pid);
};

export const makeChildOf = parent => child => {
    if (!isFSA(child) || !isFSA(parent)) {
        throw new FluxStandardActionError();
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

export const makeActionAsync = (action, uniq) => {
    if (!isFSA(action)) {
        throw new FluxStandardActionError();
    }

    const trackableAction = makeTrackable(action, uniq);

    return {
        ...trackableAction,
        meta: {
            ...trackableAction.meta,
            phase: PHASE_STARTED,
            progress: 0,
        },
    };
};

export const createAsyncAction = type => payload => makeActionAsync(createAction(type)(payload));

export const createAsyncActionUnique = type => payload => makeActionAsync(createAction(type)(payload), true);
