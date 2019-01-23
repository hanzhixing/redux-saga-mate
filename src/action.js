import stringify from 'json-stable-stringify';
import {createAction} from 'redux-actions';
import {isFSA} from 'flux-standard-action';
import set from 'ramda/src/set';
import lensProp from 'ramda/src/lensProp';
import lensPath from 'ramda/src/lensPath';
import omit from 'ramda/src/omit';
import uuidv4 from 'uuid/v4';
import uuidv5 from 'uuid/v5';
import {FluxStandardActionError} from './error';
import {PHASE_GHOST, PHASE_WAITING, PHASE_RUNNING, PHASE_FINISH} from './phase';

const UUID_NAMESPACE = uuidv4();

export const idOfAction = action => {
    if (!isFSA(action)) {
        throw new FluxStandardActionError();
    }

    const {type, payload, meta} = action;

    if (meta && meta.id) {
        return meta.id;
    }

    return uuidv5(stringify([type, payload]), UUID_NAMESPACE);
};

export const pidOfAction = action => {
    if (!isFSA(action)) {
        throw new FluxStandardActionError();
    }

    const {meta = {}} = action;

    return meta.pid;
};

export const makeTrackable = action => {
    if (!isFSA(action)) {
        throw new FluxStandardActionError();
    }

    return {
        ...action,
        meta: {
            id: idOfAction(action),
            pid: undefined,
            ctime: (new Date()).toISOString(),
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

export const isWaiting = action => action.meta.phase === PHASE_WAITING;
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
            phase: PHASE_WAITING,
            progress: 0,
        },
    };
};

export const makeActionAsync = action => {
    if (!isFSA(action)) {
        throw new FluxStandardActionError();
    }

    const trackableAction = makeTrackable(action);

    return {
        ...trackableAction,
        meta: {
            ...trackableAction.meta,
            phase: PHASE_WAITING,
            progress: 0,
        },
    };
};

export const createAsyncAction = type => payload => makeActionAsync(createAction(type)(payload));
