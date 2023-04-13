import {createAction, createAsyncAction, succeedWith, failWith, PlainValue, HyperAction} from 'redux-hyper-action';
import {ActionOperationMap, createEntityTypeReducer} from '../index';

describe('createEntityTypeReducer should create a reducer which', () => {
    const locators = {
        UPDATE: [
            ['entities'],
        ],
        REPLACE: [
            ['entities'],
        ],
        DELETE: [
            ['delete'],
        ],
        other: [
            ['other'],
        ],
        nothing: [
            ['delete'],
        ],
    };

    const ACTION_OPERATION_MAP: ActionOperationMap = {
        async_1: 'UPDATE',
        async_2: <S extends PlainValue>(s: S, a: HyperAction<string, PlainValue>) => ({
            id1: {
                x: 'x',
            },
            id2: {
                y: 'y',
                list: [1, 2, 3, 4],
            },
            id3: {
                z: 'z',
            },
        } as unknown as S),
        async_3: 'DELETE',
        // eslint-disable-next-line
        // @ts-ignore
        async_4: 'other',
        // eslint-disable-next-line
        // @ts-ignore
        async_5: 'no locator',
        // eslint-disable-next-line
        // @ts-ignore
        async_6: 'nothing',
        async_7: 'REPLACE',
    };

    const before = {
        id1: {
            x: 'x',
        },
        id2: {
            y: 'y',
            list: [1, 2],
        },
        id3: {
            z: 'z',
        },
    };

    const reducer = createEntityTypeReducer(locators, 'foo', ACTION_OPERATION_MAP);

    it('can initialize.', () => {
        const action = createAction('foo');

        expect(reducer(undefined, action)).toEqual({});
    });

    it('keep unchanged if the action type does not defined in the map.', () => {
        const action = createAction('foo');

        expect(reducer(before, action)).toBe(before);
    });

    it('keep unchanged if the async action is not finished yet.', () => {
        const action = createAsyncAction('async_1');

        expect(reducer(before, action)).toBe(before);
    });

    it('keep unchanged if the action is finished with error.', () => {
        const action = failWith('error')(createAsyncAction('async_1'));

        expect(reducer(before, action)).toBe(before);
    });

    it('keep unchanged if the operation is not defined in the locators.', () => {
        const action = succeedWith({foo: 'bar'})(createAsyncAction('async_5'));

        expect(reducer(before, action)).toBe(before);
    });

    it('keep unchanged if the action payload does not contain info according loactor.', () => {
        const action = succeedWith({foo: 'bar'})(createAsyncAction('async_4'));

        expect(reducer(before, action)).toBe(before);
    });

    it('keep unchanged if the entities for the type from action payload is falsy', () => {
        const action = succeedWith({entities: {}})(createAsyncAction('async_1'));

        expect(reducer(before, action)).toBe(before);
    });

    it('replace entity by the primary key in the action payload', () => {
        const after = {
            id1: {
                x: 'X',
            },
        };

        const action = succeedWith({
            entities: {
                foo: {
                    id1: {
                        x: 'X', },
                },
            },
        })(createAsyncAction('async_7'));

        expect(reducer(before, action)).toEqual(after);
    });

    it('update entities directly with data from action, if origin state is primary value.', () => {
        const after = {
            id1: {
                x: 'x,x',
            },
        };

        const action = succeedWith({
            entities: {
                foo: {
                    id1: {
                        x: 'x,x',
                    },
                },
            },
        })(createAsyncAction('async_1'));

        expect(reducer(1, action)).toEqual(after);
    });

    it('update entities by deep merge.', () => {
        const after = {
            id1: {
                x: 'x,x',
            },
            id2: {
                y: 'y',
                list: [1, 2],
            },
            id3: {
                z: 'z',
            },
        };

        const action = succeedWith({
            entities: {
                foo: {
                    id1: {
                        x: 'x,x',
                    },
                },
            },
        })(createAsyncAction('async_1'));

        expect(reducer(before, action)).toEqual(after);
    });

    it('update entity with simple merge.', () => {
        const after = {
            id1: {
                x: 'x,x',
            },
            id2: {
                y: 'y',
                list: [1, 2],
            },
            id3: {
                z: 'z',
            },
        };

        const action = succeedWith({
            entities: {
                foo: {
                    id1: {
                        x: 'x,x',
                    },
                },
            },
        })(createAsyncAction('async_1'));

        expect(reducer(before, action)).toEqual(after);
    });

    it('update entity with the return value of the function if an process function is provided as payload.', () => {
        const after = {
            id1: {
                x: 'x',
            },
            id2: {
                y: 'y',
                list: [1, 2, 3, 4],
            },
            id3: {
                z: 'z',
            },
        };

        const action = succeedWith({
            entities: {
                foo: {
                    id2: {
                        list: [1, 3, 4],
                    },
                },
            },
        })(createAsyncAction('async_2'));

        expect(reducer(before, action)).toEqual(after);
    });

    it('delete entity by the primary key in the action payload', () => {
        const after = {
            id1: {
                x: 'x',
            },
            id2: {
                y: 'y',
                list: [1, 2],
            },
        };

        const action = createAction('async_3', {delete: 'id3'});

        expect(reducer(before, action)).toEqual(after);
    });

    it('delete entity by the primary key array in the action payload', () => {
        const after = {
            id1: {
                x: 'x',
            },
        };

        const action = createAction('async_3', {delete: ['id2', 'id3']});

        expect(reducer(before, action)).toEqual(after);
    });

    it('keep unchanged if the operation is not UPDATE, REPLACE or DELETE.', () => {
        const action = createAction('async_6', {delete: {foo: 'id2'}});

        expect(reducer(before, action)).toEqual(before);
    });
});
