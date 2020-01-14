import {connect} from 'react-redux';
import {get} from 'lodash/fp';
import {compose} from 'recompose';
import {createSelector} from 'reselect';
import {createAsyncActionUnique, idOfAction, createSelectActions, withAsyncActionStateHandler} from 'redux-saga-mate';
import * as ActionTypes from '../../actions/types';
import ClickLoading from '../../components/SimpleButtons/ClickLoading';

export const selectActions = () => createSelectActions(
    get('actions'),
    (state, props) => props.actionIds,
);

const makeMapStateToProps = () => createSelector(
    selectActions(),
    actions => ({
        id: 3,
        loading: get(['onClick', 'isLoading'], actions),
    }),
);

const mapDispatchToProps = (dispatch, props) => ({
    onClick: () => {
        const action = dispatch(createAsyncActionUnique(ActionTypes.ASYNC_NOOP)({to: 'success', foo: 'foo'}));
        props.setActionId('onClick', idOfAction(action));
    },
});

const withRedux = connect(makeMapStateToProps, mapDispatchToProps);

export default compose(
    withAsyncActionStateHandler(),
    withRedux,
)(ClickLoading);
