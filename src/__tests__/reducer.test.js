import {SIGN} from '../sign';
import {UPDATE, REPLACE, DELETE} from '../operation';
import {
    createActionsReducer,
    createEntityTypeReducer,
    createEntitiesReducer,
    groupByComposeByEntityType,
} from '../reducer';

describe('createActionsReducer should create a reducer which', () => {
    it('can be called without argument', () => {
        const maker = jest.fn(createActionsReducer);
        maker();
        expect(maker).toHaveReturned();
    });

    const shouldCleanup = ({type}) => (type === 'clear');
    const shouldTrack = ({type}) => (type.startsWith('async'));
    const parseError = () => 'haha';

    const reducer = createActionsReducer({
        shouldCleanup,
        shouldTrack,
        parseError,
    });

    it('can initialize.', () => {
        expect(reducer(undefined, {type: 'other'})).toEqual({});
    });

    it('delete object property by action that matches the first argument.', () => {
        const before = {x: {}, y: {}, z: {}};

        const after = {x: {}, z: {}};

        const action = {type: 'clear', payload: 'y'};

        expect(reducer(before, action)).toEqual(after);
    });

    it('can process array payload when cleanup', () => {
        const before = {w: {}, x: {}, y: {}, z: {}};

        const after = {w: {}, y: {}};

        const action = {type: 'clear', payload: ['x', 'z']};

        expect(reducer(before, action)).toEqual(after);
    });

    it('returns unchanged state if the action meta is not valid.', () => {
        const state = {x: {}};

        const actions = [
            {type: 'other'},
            {type: 'other', meta: 1},
            {type: 'other', meta: true},
            {type: 'other', meta: 'string'},
            {type: 'other', meta: []},
            {type: 'other', meta: {a: 'a'}},
            {type: 'other', meta: {sign: 'other'}},
            {type: 'other', meta: {sign: SIGN}},
        ];

        actions.forEach(action => {
            expect(reducer(state, action)).toBe(state);
        });
    });

    it('returns unchanged object when the type does not match second argument', () => {
        const state = {x: {}};

        const actions = [
            {type: 'other', meta: {sign: SIGN, id: 1}},
        ];

        actions.forEach(action => {
            expect(reducer(state, action)).toBe(state);
        });
    });

    it('returns deep merged object according action payload', () => {
        const before = {
            x: {
                payload: {
                    a: 1,
                    b: {c: 1, e: 5},
                },
            },
        };

        const after = {
            x: {
                type: 'async_one',
                payload: {
                    a: 2,
                    b: {c: 2, d: 4},
                    e: 5,
                },
                meta: {
                    sign: SIGN,
                    id: 'x',
                },
            },
        };

        const action = {
            type: 'async_one',
            payload: {
                a: 2,
                b: {c: 2, d: 4},
                e: 5,
            },
            meta: {
                sign: SIGN,
                id: 'x',
            },
        };

        expect(reducer(before, action)).toEqual(after);
    });

    it('parse error with the function provided', () => {
        const error = new Error('error');

        const before = {
            x: {
                payload: {
                    a: 1,
                    b: {c: 1, e: 5},
                },
            },
        };

        const after = {
            x: {
                type: 'async_one',
                error: true,
                payload: 'haha',
                meta: {
                    sign: SIGN,
                    id: 'x',
                },
            },
        };

        const action = {
            type: 'async_one',
            error: true,
            payload: error,
            meta: {
                sign: SIGN,
                id: 'x',
            },
        };

        expect(reducer(before, action)).toEqual(after);
    });
});

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

    const EntityActionMap = {
        foo: {
            async_1: UPDATE,
            async_2: () => ({
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
            }),
            async_3: DELETE,
            async_4: 'other',
            async_5: 'no locator',
            async_6: 'nothing',
            async_7: REPLACE,
        },
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

    const reducer = createEntityTypeReducer(locators, 'foo', EntityActionMap.foo);

    it('can initialize.', () => {
        expect(reducer(undefined, {type: 'foo'})).toEqual({});
    });

    it('keep unchanged if the action type does not defined in the map.', () => {
        expect(reducer(before, {type: 'foo'})).toBe(before);
    });

    it('keep unchanged if the async action is not finished yet.', () => {
        expect(reducer(before, {type: 'async_1', meta: {phase: 'any', async: true}})).toBe(before);
    });

    it('keep unchanged if the action is finished with error.', () => {
        expect(reducer(before, {type: 'async_1', error: true, meta: {phase: 'finish'}}))
            .toBe(before);
    });

    it('keep unchanged if the operation is not defined in the locators.', () => {
        const action = {
            type: 'async_5',
            payload: {
                foo: 'bar',
            },
            meta: {
                phase: 'finish',
                async: true,
            },
        };

        expect(reducer(before, action)).toBe(before);
    });

    it('keep unchanged if the action payload does not contain info according loactor.', () => {
        const action = {
            type: 'async_4',
            payload: {
                foo: 'bar',
            },
            meta: {
                phase: 'finish',
                async: true,
            },
        };

        expect(reducer(before, action)).toBe(before);
    });

    it('keep unchanged if the entities for the type from action payload is falsy', () => {
        const action = {
            type: 'async_1',
            payload: {
                entities: {},
            },
            meta: {
                phase: 'finish',
                async: true,
            },
        };

        expect(reducer(before, action)).toBe(before);
    });

    it('replace entity by the primary key in the action payload', () => {
        const after1 = {
            id1: {
                x: 'X',
            },
        };

        const action1 = {
            type: 'async_7',
            payload: {
                entities: {
                    foo: {
                        id1: {
                            x: 'X',
                        },
                    },
                },
            },
            meta: {
                phase: 'finish',
                async: true,
            },
        };
        expect(reducer(before, action1)).toEqual(after1);
    });

    it('update entity even if the action is plain FSA', () => {
        const after1 = {
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

        const action1 = {
            type: 'async_1',
            payload: {
                entities: {
                    foo: {
                        id1: {
                            x: 'x,x',
                        },
                    },
                },
            },
        };
        expect(reducer(before, action1)).toEqual(after1);
    });

    it('update entity with simple merge.', () => {
        const after1 = {
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

        const action1 = {
            type: 'async_1',
            payload: {
                entities: {
                    foo: {
                        id1: {
                            x: 'x,x',
                        },
                    },
                },
            },
            meta: {
                phase: 'finish',
                async: true,
            },
        };
        expect(reducer(before, action1)).toEqual(after1);
    });

    it('update entity with the return value of the function if an function is provided.', () => {
        const after2 = {
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

        const action2 = {
            type: 'async_2',
            payload: {
                entities: {
                    foo: {
                        id2: {
                            list: [1, 3, 4],
                        },
                    },
                },
            },
            meta: {
                phase: 'finish',
                async: true,
            },
        };


        expect(reducer(before, action2)).toEqual(after2);
    });

    it('delete entity by the primary key in the action payload', () => {
        const after3 = {
            id1: {
                x: 'x',
            },
            id2: {
                y: 'y',
                list: [1, 2],
            },
        };

        const action3 = {
            type: 'async_3',
            payload: {
                delete: 'id3',
            },
            meta: {
                phase: 'finish',
                async: true,
            },
        };

        expect(reducer(before, action3)).toEqual(after3);
    });

    it('delete entity by the primary key array in the action payload', () => {
        const after = {
            id1: {
                x: 'x',
            },
        };

        const action = {
            type: 'async_3',
            payload: {
                delete: ['id2', 'id3'],
            },
            meta: {
                phase: 'finish',
                async: true,
            },
        };

        expect(reducer(before, action)).toEqual(after);
    });

    it('keep unchanged if the operation is not UPDATE, REPLACE or DELETE.', () => {
        const action = {
            type: 'async_6',
            payload: {
                delete: {
                    foo: 'id2',
                },
            },
            meta: {
                phase: 'finish',
                async: true,
            },
        };

        expect(reducer(before, action)).toEqual(before);
    });
});

describe('createEntitiesReducer', () => {
    const locators = {
        UPDATE: [
            ['entities'],
        ],
        DELETE: [
            ['delete'],
        ],
    };

    const EntityActionMap = {
        foo: {
            act1: UPDATE,
            act2: DELETE,
        },
        bar: {
            act3: UPDATE,
        },
    };

    const reducer = createEntitiesReducer(locators, EntityActionMap);

    it('create object of which every property maps string key to a function', () => {
        expect(Object.keys(reducer)).toEqual(['foo', 'bar']);
        expect(Object.values(reducer).map(v => (typeof v))).toEqual(['function', 'function']);
    });
});

describe('groupByComposeByEntityType', () => {
    const fn1 = jest.fn(() => {});
    const fn2 = jest.fn(() => {});
    const fn3 = jest.fn(() => {});
    const fn4 = jest.fn(() => {});
    const fn5 = jest.fn(() => {});

    const args = [
        {key1: fn1},
        {key1: fn2},
        {key2: fn3},
        {key2: fn4, key3: fn5},
    ];

    /**
     * [{key1: fn1}, {key1: fn11}, {key2: fn2}, {key2: fn22, key3: fn3}]
     * =>
     * {key1: [fn1, fn11], key2: [fn2, fn22], key3: [fn3]}
     */

    const reducer = groupByComposeByEntityType(...args);

    it('should be abled to group passed objects by the object keys', () => {
        expect(Object.keys(reducer)).toEqual(['key1', 'key2', 'key3']);
    });

    it('should call reducer functions in order with same key', () => {
        reducer.key1();
        expect(fn1).toHaveBeenCalledBefore(fn2);

        reducer.key2();
        expect(fn3).toHaveBeenCalledBefore(fn4);

        reducer.key3();
        expect(fn5).toHaveBeenCalledTimes(1);
    });
});
