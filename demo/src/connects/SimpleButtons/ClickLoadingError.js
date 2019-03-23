import {connect} from 'react-redux';
import {createAction} from 'redux-actions';
import {get} from 'lodash/fp';
import {compose, lifecycle, withState, withProps} from 'recompose';
import {createSelector} from 'reselect';
import {createAsyncAction, idOfAction, createSelectActions, withAsyncActionStateHandler} from 'redux-saga-mate';
import {delay} from '../../utils';
import * as ActionTypes from '../../actions/types';
import ClickLoadingError from '../../components/SimpleButtons/ClickLoadingError';

export const selectActions = () => createSelectActions(
    get('actions'),
    (state, props) => props.actionIds,
);

const makeMapStateToProps = () => createSelector(
    selectActions(),
    (state, props) => props.actionIds,
    (actions, actionIds) => ({
        loading: get(['onClick', 'isLoading'], actions),
        error: get(['onClick', 'error'], actions),
    }),
);

const mapDispatchToProps = (dispatch, props) => ({
    onClick: () => {
        const actionId = idOfAction(dispatch(
            createAsyncAction(ActionTypes.ASYNC_NOOP)({to: 'fail'})
        ));
        props.setActionId('onClick', actionId);
    },
    onReset: () => {
        props.unsetActionId('onClick');
        dispatch(createAction(ActionTypes.CLEANUP)(props.actionIds.onClick));
    },
});

const withRedux = connect(makeMapStateToProps, mapDispatchToProps);

export default compose(
    withAsyncActionStateHandler(),
    withRedux,
)(ClickLoadingError);
