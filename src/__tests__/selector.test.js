import {createSelectActions} from '../selector';
import {isFinished} from '../action';

const act1 = {
    type: 'TYPE1',
    payload: 'hello1',
    meta: {
        id: '004c022c-1555-45cb-b385-3a3012a83bc6',
        phase: 'started',
    },
};

const act2 = {
    type: 'TYPE2',
    payload: 'hello2',
    meta: {
        id: '2aec8023-6944-46dc-9f5e-94bf91644c79',
        phase: 'running',
    },
};

const act3 = {
    type: 'TYPE3',
    payload: 'hello3',
    meta: {
        id: '973a8ccc-22b7-4882-a47f-138374731d10',
        phase: 'finished',
    },
};

const act4 = {
    type: 'TYPE4',
    payload: new Error('error'),
    error: true,
    meta: {
        id: '1e1a2db3-915c-45e4-bf1a-163cdfb5723d',
        phase: 'finished',
    },
}
const actions = {
    '004c022c-1555-45cb-b385-3a3012a83bc6': act1,
    '2aec8023-6944-46dc-9f5e-94bf91644c79': act2,
    '973a8ccc-22b7-4882-a47f-138374731d10': act3,
    '1e1a2db3-915c-45e4-bf1a-163cdfb5723d': act4,
};

const actionIds = {
    callback1: '004c022c-1555-45cb-b385-3a3012a83bc6',
    callback2: {
        x: '2aec8023-6944-46dc-9f5e-94bf91644c79',
        y: '973a8ccc-22b7-4882-a47f-138374731d10',
        a: {
            b: '1e1a2db3-915c-45e4-bf1a-163cdfb5723d',
        }
    },
    callback3: {
        x: 'empty',
        a: {
            b: 'empty',
        },
    },
};

const desired = {
    callback1: {
        payload: act1.payload,
        isLoading: !isFinished(act1),
    },
    callback2: {
        x: {
            payload: act2.payload,
            isLoading: !isFinished(act2),
        },
        y: {
            payload: act3.payload,
            isLoading: !isFinished(act3),
        },
        a: {
            b: {
                payload: act4.payload,
                isLoading: !isFinished(act3),
                error: act4.error,
            }
        }
    },
    callback3: {
        a: {},
    }
};

const selectActions = (state, props) => actions;
const selectActionIds = (state, props) => actionIds;

const state = {actions};
const props = {actionIds};

describe('createSelectActions', () => {
    const selectTransients = createSelectActions(selectActions, selectActionIds);

    it('should return selector, which fill actual entities according action ids', () => {
        expect(selectTransients(state, props)).toEqual(desired);
    });
});
