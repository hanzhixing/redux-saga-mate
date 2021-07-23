import {PHASE_STARTED, PHASE_RUNNING, PHASE_FINISH} from '../phase';
import {
    isReduxSagaMateAction,
    idOfAction,
    pidOfAction,
    createTrackableAction,
    trackFor,
    isAsync,
    isUnique,
    isStarted,
    isRunning,
    isFinished,
    continueWith,
    succeedWith,
    failWith,
    isChildOf,
    makeChildOf,
    createAsyncAction,
    createAsyncActionUnique,
} from '../action';

const REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REGEX_ISO8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

class Foo {}

describe('isReduxSagaMateAction', () => {
    it('should return FALSE if the action is not plain object', () => {
        [
            'string',
            1,
            true,
            undefined,
            null,
            [],
            () => {},
            new Foo(),
            /regex/,
        ].forEach(v => {
            expect(isReduxSagaMateAction(v)).toBe(false);
        });
    });

    it('should return FALSE if the action type is not string', () => {
        [
            1,
            true,
            undefined,
            null,
            [],
            () => {},
            new Foo(),
            /regex/,
        ].forEach(v => {
            expect(isReduxSagaMateAction({type: v})).toBe(false);
        });
    });

    it('should return FALSE if the action has property unknown', () => {
        expect(isReduxSagaMateAction({type: 'type', foo: 'foo'})).toBe(false);
    });

    it('should return FALSE if the action has meta but in wrong type', () => {
        [
            'string',
            1,
            true,
            [],
            () => {},
            new Foo(),
            /regex/,
        ].forEach(v => {
            expect(isReduxSagaMateAction({type: 'type', meta: v})).toBe(false);
        });
    });

    it('should return FALSE if the action has meta but has property unknown', () => {
        expect(isReduxSagaMateAction({type: 'type', meta: {foo: 'foo'}})).toBe(false);
    });

    it('should return TRUE if the action has type in string and no meta', () => {
        expect(isReduxSagaMateAction({type: 'type'})).toBe(true);
    });
});

describe('idOfAction', () => {
    const action = {
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
        expect(() => idOfAction({a: 'a', b: 'b'})).toThrow(Error);
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
    it('should throw error if the action is not FSA', () => {
        expect(() => pidOfAction({a: 'a', b: 'b'})).toThrow(Error);
    });

    it('should return the pid of the action', () => {
        const action = {
            type: 'type',
            payload: 'payload',
            meta: {
                pid: 'pid',
            },
        };
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

describe('createTrackableAction', () => {
    const action = {
        type: 'type',
        payload: 'payload',
    };

    const desired1 = {
        type: 'type',
        payload: 'payload',
        meta: {
            id: idOfAction(action),
            pid: undefined,
            ctime: expect.stringMatching(REGEX_ISO8601),
        },
    };

    it('should throw error if the action is not a ReduxSagaMateAction', () => {
        expect(() => createTrackableAction({a: 'a', b: 'b'})).toThrow(Error);
    });

    it('should fill meta with correct properties', () => {
        expect(createTrackableAction(action)).toMatchObject(desired1);
    });

    it('should generates a ctime before now at most in 1 second', () => {
        expect(Date.parse(createTrackableAction(action).meta.ctime))
            .toBeGreaterThanOrEqual(Date.now() - 1000);
    });

    const desired2 = {
        type: 'type',
        payload: 'payload',
        meta: {
            id: idOfAction(action),
            async: true,
        },
    }

    it('should fill correct async meta with async option', () => {
        expect(createTrackableAction(action, {async: true})).toMatchObject(desired2);
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

    it('should throw error if the action is not a ReduxSagaMateAction', () => {
        expect(() => trackFor({a: 'a'})(undefined)).toThrow(Error);
        expect(() => trackFor({type: 'type'})({a: 'a'})).toThrow(Error);
    });

    const enhancedParent = createAsyncAction(parent.type)(parent.payload);

    it('should attach id of the parent to the child', () => {
        expect(trackFor(parent)(child).meta.pid).toBe(enhancedParent.meta.id);
    });
});

describe('isAsync', () => {
    const action = {
        type: 'type',
        payload: 'payload',
    };

    const enhanced = createAsyncAction(action.type)(action.payload);

    it('should be TRUE if the action is async', () => {
        expect(isAsync(enhanced)).toBe(true);
    });
});

describe('isUnique', () => {
    const action = {
        type: 'type',
        payload: 'payload',
    };

    const enhanced = createAsyncActionUnique(action.type)(action.payload);

    it('should be TRUE if the action is unique', () => {
        expect(isUnique(enhanced)).toBe(true);
    });
});

describe('isStarted', () => {
    const action = {
        type: 'type',
        payload: 'payload',
    };

    const enhanced = createAsyncAction(action.type)(action.payload);

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

    const enhanced = createAsyncAction(action.type)(action.payload);

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

    const enhanced = createAsyncAction(action.type)(action.payload);

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

    const enhanced = createTrackableAction(action);

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
        },
    };

    it('should throw error if the action is not FSA', () => {
        expect(() => continueWith('hello')({a: 'a', b: 'b'})).toThrow(Error);
    });

    it('should fill meta with continue signal and new payload', () => {
        expect(continueWith(payload, 50)(enhanced)).toMatchObject(desired);
    });

    it('should generates a utime before now at most in 1 second', () => {
        expect(Date.parse(continueWith(payload, 50)(enhanced).meta.utime))
            .toBeGreaterThanOrEqual(Date.now() - 1000);
    });
});

describe('succeedWith', () => {
    const action = {
        type: 'type',
        payload: 'payload',
    };

    const enhanced = createTrackableAction(action);

    const desired = {
        ...enhanced,
        type: 'type',
        payload: 'success',
        meta: {
            ...enhanced.meta,
            phase: PHASE_FINISH,
            progress: 100,
            utime: expect.stringMatching(REGEX_ISO8601),
        },
    };

    const payload = 'success';

    it('should throw error if the action is not FSA', () => {
        expect(() => succeedWith('hello')({a: 'a', b: 'b'})).toThrow(Error);
    });

    it('should fill meta with finished signal and new payload', () => {
        expect(succeedWith(payload)(enhanced)).toMatchObject(desired);
    });

    it('should generates a utime before now at most in 1 second', () => {
        expect(Date.parse(succeedWith(payload)(enhanced).meta.utime))
            .toBeGreaterThanOrEqual(Date.now() - 1000);
    });
});

describe('failWith', () => {
    const action = {
        type: 'type',
        payload: 'payload',
    };

    const enhanced = createTrackableAction(action);

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
        },
    };

    it('should throw error if the action is not FSA', () => {
        expect(() => failWith('hello')({a: 'a', b: 'b'})).toThrow(Error);
    });

    it('should fill meta with failed signal and error object as payload', () => {
        expect(failWith(error)(enhanced)).toMatchObject(desired);
    });

    it('should generates a utime before now at most in 1 second', () => {
        expect(Date.parse(succeedWith(error)(enhanced).meta.utime))
            .toBeGreaterThanOrEqual(Date.now() - 1000);
    });
});

describe('isChildOf', () => {
    const child1 = {
        type: 'child',
        payload: 'child',
        meta: {
            pid: 'pid',
        },
    };

    const child2 = {
        type: 'child',
        payload: 'child',
        meta: {
            pid: 'pid2',
        },
    };

    const parent = {
        type: 'parent',
        payload: 'parent',
        meta: {
            id: 'pid',
        },
    };

    it('should throw error if the action is not a ReduxSagaMateAction', () => {
        expect(() => isChildOf({a: 'a'})(undefined)).toThrow(Error);
        expect(() => isChildOf({type: 'type'})({a: 'a'})).toThrow(Error);
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
        },
    };

    it('should throw error if the action is not a ReduxSagaMateAction', () => {
        expect(() => makeChildOf({a: 'a'})(undefined)).toThrow(Error);
        expect(() => makeChildOf({type: 'type'})({a: 'a'})).toThrow(Error);
    });

    it('should set pid of the action with the id of parent', () => {
        expect(makeChildOf(parent)(child).meta.pid).toBe(parent.meta.id);
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
