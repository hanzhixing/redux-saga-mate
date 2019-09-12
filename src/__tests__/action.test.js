import {PHASE_GHOST, PHASE_STARTED, PHASE_RUNNING, PHASE_FINISH} from '../phase';
import {FluxStandardActionError} from '../error';
import {
    idOfAction,
    pidOfAction,
    makeTrackable,
    trackFor,
    isUnique,
    isStarted,
    isRunning,
    isFinished,
    continueWith,
    succeedWith,
    failWith,
    isChildOf,
    makeChildOf,
    makeActionAsync,
    createAsyncAction,
    createAsyncActionUnique,
} from '../action';

const REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REGEX_ISO8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('idOfAction', () => {
    const action = {
        type: 'type',
        payload: 'payload1',
    };

    const actionSame = {
        type: 'type',
        payload: 'payload1',
    };

    const action1 = {
        type: 'type',
        payload: 'payload1',
    };

    const action2 = {
        type: 'type',
        payload: 'payload2',
    };

    const action3 = {
        type: 'type3',
        payload: 'payload',
    };

    const action4 = {
        type: 'type4',
        payload: 'payload',
    };

    it('should throw error if the action is not FSA', () => {
        expect(() => idOfAction({a: 'a', b: 'b'})).toThrow(FluxStandardActionError);
    });

    it('should generate id in uuid format', () => {
        expect(idOfAction(action)).toMatch(REGEX_UUID);
    });

    it('should generate same ids for same actions', () => {
        expect(idOfAction(action1)).toBe(idOfAction(action));
    });

    it('should generate different ids for different actions', () => {
        expect(idOfAction(action2)).not.toBe(idOfAction(action1));
        expect(idOfAction(action4)).not.toBe(idOfAction(action3));
    });

    it('should generate different ids for same action if uniq flag is true', () => {
        jest.useFakeTimers();
        const id = idOfAction(action, true);

        setTimeout(() => {
            expect(idOfAction(action1, true)).not.toBe(id);
        }, 1);
        jest.runAllTimers();
        jest.clearAllTimers();
    });
});

describe('pidOfAction', () => {
    const action = {
        type: 'type',
        payload: 'payload',
        meta: {
            pid: 'pid',
        },
    };

    it('should throw error if the action is not FSA', () => {
        expect(() => pidOfAction({a: 'a', b: 'b'})).toThrow(FluxStandardActionError);
    });

    it('should return the pid of the action', () => {
        expect(pidOfAction(action)).toBe(action.meta.pid);
    });

    it('should return undefined if the action has no meta', () => {
        const action = {
            type: 'type',
            payload: 'payload',
        };
        expect(pidOfAction(action)).toBe(undefined);
    });
});

describe('makeTrackable', () => {
    const action = {
        type: 'type',
        payload: 'payload',
    };

    const desired = {
        type: 'type',
        payload: 'payload',
        meta: {
            id: idOfAction(action),
            pid: undefined,
            ctime: expect.stringMatching(REGEX_ISO8601),
        },
    };

    it('should throw error if the action is not FSA', () => {
        expect(() => makeTrackable({a: 'a', b: 'b'})).toThrow(FluxStandardActionError);
    });

    it('should fill meta with correct properties', () => {
        expect(makeTrackable(action)).toMatchObject(desired);
    });

    it('should generates a ctime before now at most in 1 second', () => {
        expect(Date.parse(makeTrackable(action).meta.ctime)).toBeGreaterThanOrEqual(Date.now() - 1000);
    });
});

describe('trackFor', () => {
    const child = {
        type: 'child',
        payload: 'child',
    };

    const parent = {
        type: 'parent',
        payload: 'parent',
    };

    it('should throw error if the action is not FSA', () => {
        expect(() => trackFor({a: 'a'})({b: 'b'})).toThrow(FluxStandardActionError);
    });

    const enhancedChild = makeActionAsync(child);
    const enhancedParent = makeActionAsync(parent);

    it('should attach id of the parent to the child', () => {
        expect(trackFor(parent)(child).meta.pid).toBe(enhancedParent.meta.id);
    });
});

describe('isUnique', () => {
    const action = {
        type: 'type',
        payload: 'payload',
    };

    const enhanced = makeActionAsync(action, true);

    it('should be TRUE if the action is unique', () => {
        expect(isUnique(enhanced)).toBe(true);
    });
});

describe('isStarted', () => {
    const action = {
        type: 'type',
        payload: 'payload',
    };

    const enhanced = makeActionAsync(action);

    it('should be TRUE if the action is branch new', () => {
        expect(isStarted(enhanced)).toBe(true);
    });

    it('should be FALSE if the action is continued', () => {
        expect(isStarted(continueWith('success')(enhanced))).toBe(false);
    });

    it('should be FALSE if the action is succeed', () => {
        expect(isStarted(succeedWith('success')(enhanced))).toBe(false);
    });

    it('should be FALSE if the action is failed', () => {
        expect(isStarted(failWith('success')(enhanced))).toBe(false);
    });
});

describe('isRunning', () => {
    const action = {
        type: 'type',
        payload: 'payload',
    };

    const enhanced = makeActionAsync(action);

    it('should be FALSE if the action is branch new', () => {
        expect(isRunning(enhanced)).toBe(false);
    });

    it('should be TRUE if the action is continued', () => {
        expect(isRunning(continueWith('continue')(enhanced))).toBe(true);
    });

    it('should be FALSE if the action is succeed', () => {
        expect(isRunning(succeedWith('success')(enhanced))).toBe(false);
    });

    it('should be FALSE if the action is failed', () => {
        expect(isStarted(failWith(new Error('error'))(enhanced))).toBe(false);
    });
});

describe('isFinished', () => {
    const action = {
        type: 'type',
        payload: 'payload',
    };

    const enhanced = makeActionAsync(action);

    it('should be FALSE if the action is branch new', () => {
        expect(isFinished(enhanced)).toBe(false);
    });

    it('should be FALSE if the action is continued', () => {
        expect(isFinished(continueWith('continue')(enhanced))).toBe(false);
    });

    it('should be TRUE if the action is succeed', () => {
        expect(isFinished(succeedWith('success')(enhanced))).toBe(true);
    });

    it('should be TRUE if the action is failed', () => {
        expect(isFinished(failWith(new Error('error'))(enhanced))).toBe(true);
    });
});

describe('continueWith', () => {
    const action = {
        type: 'type',
        payload: 'payload',
    };

    const enhanced = makeTrackable(action);

    const payload = 'to be continue';

    const desired = {
        ...enhanced,
        type: 'type',
        payload,
        meta: {
            ...enhanced.meta,
            phase: PHASE_RUNNING,
            progress: 50,
            utime: expect.stringMatching(REGEX_ISO8601),
        }
    };

    it('should throw error if the action is not FSA', () => {
        expect(() => continueWith('hello')({a: 'a', b: 'b'})).toThrow(FluxStandardActionError);
    });

    it('should fill meta with continue signal and new payload', () => {
        expect(continueWith(payload, 50)(enhanced)).toMatchObject(desired);
    });

    it('should generates a utime before now at most in 1 second', () => {
        expect(Date.parse(continueWith(payload, 50)(enhanced).meta.utime)).toBeGreaterThanOrEqual(Date.now() - 1000);
    });
});

describe('succeedWith', () => {
    const action = {
        type: 'type',
        payload: 'payload',
    };

    const enhanced = makeTrackable(action);

    const desired = {
        ...enhanced,
        type: 'type',
        payload: 'success',
        meta: {
            ...enhanced.meta,
            phase: PHASE_FINISH,
            progress: 100,
            utime: expect.stringMatching(REGEX_ISO8601),
        }
    };

    const payload = 'success';

    it('should throw error if the action is not FSA', () => {
        expect(() => succeedWith('hello')({a: 'a', b: 'b'})).toThrow(FluxStandardActionError);
    });

    it('should fill meta with finished signal and new payload', () => {
        expect(succeedWith(payload)(enhanced)).toMatchObject(desired);
    });

    it('should generates a utime before now at most in 1 second', () => {
        expect(Date.parse(succeedWith(payload)(enhanced).meta.utime)).toBeGreaterThanOrEqual(Date.now() - 1000);
    });
});

describe('failWith', () => {
    const action = {
        type: 'type',
        payload: 'payload',
    };

    const enhanced = makeTrackable(action);

    const error = new Error('success');

    const desired = {
        ...enhanced,
        type: 'type',
        payload: error,
        error: true,
        meta: {
            ...enhanced.meta,
            phase: PHASE_FINISH,
            progress: 100,
            utime: expect.stringMatching(REGEX_ISO8601),
        }
    };

    it('should throw error if the action is not FSA', () => {
        expect(() => failWith('hello')({a: 'a', b: 'b'})).toThrow(FluxStandardActionError);
    });

    it('should fill meta with failed signal and error object as payload', () => {
        expect(failWith(error)(enhanced)).toMatchObject(desired);
    });

    it('should generates a utime before now at most in 1 second', () => {
        expect(Date.parse(succeedWith(error)(enhanced).meta.utime)).toBeGreaterThanOrEqual(Date.now() - 1000);
    });
});

describe('isChildOf', () => {
    const child1 = {
        type: 'child',
        payload: 'child',
        meta: {
            pid: 'pid',
        }
    };

    const child2 = {
        type: 'child',
        payload: 'child',
        meta: {
            pid: 'pid2',
        }
    };

    const parent = {
        type: 'parent',
        payload: 'parent',
        meta: {
            id: 'pid',
        }
    };

    it('should throw error if the action is not FSA', () => {
        expect(() => isChildOf({a: 'a'})({b: 'b'})).toThrow(FluxStandardActionError);
    });

    it('should be TRUE if the pid of the child is the same as the id of parent', () => {
        expect(isChildOf(parent)(child1)).toBe(true);
    });

    it('should be FALSE if the pid of the child is the same as the id of parent', () => {
        expect(isChildOf(parent)(child2)).toBe(false);
    });
});

describe('makeChildOf', () => {
    const child = {
        type: 'child',
        payload: 'child',
    };

    const parent = {
        type: 'parent',
        payload: 'parent',
        meta: {
            id: 'pid',
        }
    };

    it('should throw error if the action is not FSA', () => {
        expect(() => makeChildOf({a: 'a'})({b: 'b'})).toThrow(FluxStandardActionError);
    });

    it('should set pid of the action with the id of parent', () => {
        expect(makeChildOf(parent)(child).meta.pid).toBe(parent.meta.id);
    });
});

describe('makeActionAsync', () => {
    const action = {
        type: 'type',
        payload: 'payload',
    };

    const desired = {
        type: 'type',
        payload: 'payload',
        meta: {
            id: idOfAction(action),
            pid: undefined,
            ctime: expect.stringMatching(REGEX_ISO8601),
            phase: PHASE_STARTED,
            progress: 0,
        },
    };

    it('should throw error if the action is not FSA', () => {
        expect(() => makeActionAsync({a: 'a'})).toThrow(FluxStandardActionError);
    });

    it('should fill meta with start signal', () => {
        expect(makeActionAsync(action)).toMatchObject(desired);
    });
});

describe('createAsyncAction', () => {
    const action = {
        type: 'type',
        payload: 'payload',
    };

    const desired = {
        type: 'type',
        payload: 'payload',
        meta: {
            id: idOfAction(action),
            pid: undefined,
            ctime: expect.stringMatching(REGEX_ISO8601),
            phase: PHASE_STARTED,
            progress: 0,
        },
    };

    it('should fill meta with correct properties', () => {
        expect(createAsyncAction(action.type)(action.payload)).toMatchObject(desired);
    });
});

describe('createAsyncActionUnique', () => {
    const action = {
        type: 'type',
        payload: 'payload',
    };

    const desired = {
        type: 'type',
        payload: 'payload',
        meta: {
            id: expect.stringMatching(REGEX_UUID),
            pid: undefined,
            ctime: expect.stringMatching(REGEX_ISO8601),
            phase: PHASE_STARTED,
            uniq: true,
            progress: 0,
        },
    };

    it('should fill meta with correct properties', () => {
        expect(createAsyncActionUnique(action.type)(action.payload)).toMatchObject(desired);
    });
});
