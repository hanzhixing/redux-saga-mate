import {connect} from 'react-redux';
import {createAction} from 'redux-actions';
import {compose, get} from 'lodash/fp';
import {createSelector} from 'reselect';
import {createAsyncAction, idOfAction, createSelectActions, withAsyncActionStateHandler} from 'redux-saga-mate';
import * as ActionTypes from '../../actions/types';
import ClickLoadingError from '../../components/SimpleButtons/ClickLoadingError';

export const selectActions = () => createSelectActions(
    get('actions'),
    (state, props) => props.actionIds,
);

const makeMapStateToProps = () => createSelector(
    selectActions(),
    actions => ({
        loading: get(['onClick', 'isLoading'], actions),
        error: get(['onClick', 'error'], actions),
    }),
);

const mapDispatchToProps = (dispatch, {actionIds, setActionId, unsetActionId}) => ({
    onClick: () => {
        const action = dispatch(
            createAsyncAction(ActionTypes.ASYNC_NOOP)({to: 'fail'}),
        );
        setActionId('onClick', idOfAction(action));
    },
    onReset: () => {
        unsetActionId('onClick');
        dispatch(createAction(ActionTypes.CLEANUP)(actionIds.onClick));
    },
});

const withRedux = connect(makeMapStateToProps, mapDispatchToProps);

export default compose(
    withAsyncActionStateHandler(),
    withRedux,
)(ClickLoadingError);
