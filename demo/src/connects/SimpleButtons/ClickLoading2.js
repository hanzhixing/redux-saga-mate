import {connect} from 'react-redux';
import {get} from 'lodash/fp';
import {compose} from 'recompose';
import {createSelector} from 'reselect';
import {createAsyncAction, idOfAction, createSelectActions, withAsyncActionStateHandler} from 'redux-saga-mate';
import {delay} from '../../utils';
import * as ActionTypes from '../../actions/types';
import ClickLoading from '../../components/SimpleButtons/ClickLoading';

export const selectActions = () => createSelectActions(
    get('actions'),
    (state, props) => props.actionIds,
);

const makeMapStateToProps = () => createSelector(
    selectActions(),
    (state, props) => props.actionIds,
    (actions, actionIds) => ({
        id: 2,
        loading: get(['onClick', 'isLoading'], actions),
    }),
);

const mapDispatchToProps = (dispatch, props) => ({
    onClick: () => {
        const action = dispatch(createAsyncAction(ActionTypes.ASYNC_NOOP)({to: 'success', foo: 'foo'}));
        props.setActionId('onClick', idOfAction(action));
    },
});

const withRedux = connect(makeMapStateToProps, mapDispatchToProps);

export default compose(
    withAsyncActionStateHandler(),
    withRedux,
)(ClickLoading);
