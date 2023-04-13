import {assocPath} from 'ramda';
import {AnyAction} from '@reduxjs/toolkit';
import {createAction, idOfAction, HyperAction} from 'redux-hyper-action';
import {createActionsReducer} from '../index';

const SIGN = 'redux-hyper-action';

describe('createActionsReducer should create a reducer which', () => {
    it('can be called without argument', () => {
        const maker = jest.fn(createActionsReducer);
        maker();
        expect(maker).toHaveReturned();
    });

    const shouldCleanup = ({type}: AnyAction) => (type === 'clear');
    const shouldTrack = ({type}: AnyAction) => (type.startsWith('async'));

    const reducer = createActionsReducer({
        shouldCleanup,
        shouldTrack,
    });

    it('can initialize.', () => {
        const action = createAction('other');
        expect(reducer(undefined, action)).toEqual({});
    });

    it('delete object property by action that matches the first argument.', () => {
        const before = {x: {}, y: {}, z: {}};

        const after = {x: {}, z: {}};

        const action = createAction('clear', 'y');

        expect(reducer(before, action)).toEqual(after);
    });

    it('can process only string or string array payload when cleanup.', () => {
        const before = {w: {}, x: {}, y: {}, z: {}};

        const action1 = createAction('clear', true);
        const action2 = createAction('clear', [0, null, false]);

        expect(() => reducer(before, action1)).toThrow();
        expect(() => reducer(before, action2)).toThrow();
    });

    it('can process array payload when cleanup', () => {
        const before = {w: {}, x: {}, y: {}, z: {}};

        const after = {w: {}, y: {}};

        const action = createAction('clear', ['x', 'z']);

        expect(reducer(before, action)).toEqual(after);
    });

    it('returns unchanged state if the action meta is not valid.', () => {
        const state = {x: {}};

        const action = createAction('other');

        const actions = [
            assocPath(['meta'], undefined, action),
            assocPath(['meta'], 1, action),
            assocPath(['meta'], true, action),
            assocPath(['meta'], 'string', action),
            assocPath(['meta'], [], action),
            assocPath(['meta'], {a: 'a'}, action),
            assocPath(['meta', 'sign'], 'other', action),
            assocPath(['meta'], {sign: SIGN}, action),
        ];

        actions.forEach(action => {
            // @ts-ignore
            expect(reducer(state, action)).toBe(state);
        });
    });

    it('returns unchanged object when the type does not match second argument', () => {
        const state = {x: {}};

        const action = createAction('other');

        const actions = [
            assocPath(['meta', 'id'], 1, action),
        ];

        actions.forEach(action => {
            expect(reducer(state, action)).toBe(state);
        });
    });

    it('returns merged action object except payload from the action.', () => {
        const payload = {
            a: 5,
            b: {
                c: 9,
                d: 7,
                e: {
                    f: 3,
                },
            },
            e: 6,
        };

        const action = createAction('async', payload);

        const before = {
            [idOfAction(action)]: {
                ...action,
                payload: {
                    a: 1,
                    b: {
                        c: 1,
                        e: {
                            f: 7,
                            g: 9,
                        },
                    },
                    f: 3,
                },
            },
        };

        const after = {
            [idOfAction(action)]: {
                ...action,
                payload: {
                    a: 5,
                    b: {
                        c: 9,
                        d: 7,
                        e: {
                            f: 3,
                        },
                    },
                    e: 6,
                },
            },
        };

        expect(reducer(before, action)).toEqual(after);
    });
});
