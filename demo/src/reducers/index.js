import {combineReducers} from 'redux';
import {concat, difference} from 'lodash/fp';
import {createActionsReducer, createEntitiesReducer, groupByComposeByEntityType} from 'redux-saga-mate/lib/reducer';
import {UPDATE, DELETE} from 'redux-saga-mate/lib/operation';
import * as ActionTypes from '../actions/types';
import ui from './ui';

const EntityActionMap = {
    posts: {
        [ActionTypes.ASYNC_GET_MANY_POST]: [
            UPDATE,
            (k, l, r) => (k === 'commenters' ? concat(l, difference(r, l)) : r),
        ],
        [ActionTypes.ASYNC_DELETE_ONE_POST]: DELETE,
        [ActionTypes.ASYNC_PATCH_ONE_POST]: UPDATE,
    },
    users: {
        [ActionTypes.ASYNC_GET_MANY_POST]: UPDATE,
        [ActionTypes.ASYNC_GET_ONE_USER_BY_POST_ID]: UPDATE,
    },
};

export default combineReducers({
    actions: createActionsReducer([ActionTypes.CLEANUP, /^ASYNC_/]),
    session: (state = {}, action) => state,
    entities: combineReducers(
        groupByComposeByEntityType(
            createEntitiesReducer(EntityActionMap),
            {},
        ),
    ),
    ui,
});
