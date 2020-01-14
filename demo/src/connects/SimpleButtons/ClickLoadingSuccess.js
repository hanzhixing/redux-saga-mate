import {connect} from 'react-redux';
import {compose, get} from 'lodash/fp';
import {createSelector} from 'reselect';
import {createAsyncAction, idOfAction, createSelectActions, withAsyncActionStateHandler} from 'redux-saga-mate';
import * as ActionTypes from '../../actions/types';
import ClickLoadingSuccess from '../../components/SimpleButtons/ClickLoadingSuccess';

export const selectActions = () => createSelectActions(
    get('actions'),
    (state, props) => props.actionIds,
);

const makeMapStateToProps = () => createSelector(
    selectActions(),
    (state, props) => props.actionIds,
    (actions, actionIds) => ({
        clicked: !!actionIds.onClick,
        loading: get(['onClick', 'isLoading'], actions),
        error: get(['onClick', 'error'], actions),
    }),
);

const mapDispatchToProps = (dispatch, {setActionId, unsetActionId}) => ({
    onClick: () => {
        const action = dispatch(
            createAsyncAction(ActionTypes.ASYNC_NOOP)({to: 'success'}),
        );
        setActionId('onClick', idOfAction(action));
    },
    onReset: () => {
        unsetActionId('onClick');
    },
});

const withRedux = connect(makeMapStateToProps, mapDispatchToProps);

export default compose(
    withAsyncActionStateHandler(),
    withRedux,
)(ClickLoadingSuccess);
