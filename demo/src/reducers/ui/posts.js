import {isFinished} from 'redux-saga-mate/lib/action';
import {compose, get, set} from 'lodash/fp';
import * as ActionTypes from '../../actions/types';

export default (state = {}, action) => {
    switch (action.type) {
        case ActionTypes.ASYNC_GET_MANY_POST: {
            if (isFinished(action) && !action.error) {
                const {payload: {request: {meta: {page}}, response: {result}}} = action;
                const pathOfBuffer = [page, 'buffer'];
                const pathOfIds = [page, 'ids'];
                if (page > 3 && (get(pathOfIds, state) || []).length > 0) {
                    return set(pathOfBuffer, result, state);
                }
                return set(pathOfIds, result, state);
            }
            return state;
        }
        case ActionTypes.ACCEPT_UPDATE_POST_LIST: {
            const {payload: {page}} = action;
            const pathOfBuffer = [page, 'buffer'];
            const pathOfIds = [page, 'ids'];
            const moveBufferToIds = compose(
                set(pathOfBuffer, undefined),
                set(pathOfIds, get(pathOfBuffer, state)),
            );
            return moveBufferToIds(state);
        }
        default: {
            return state;
        }
    }
};
