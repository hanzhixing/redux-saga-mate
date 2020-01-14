import {connect} from 'react-redux';
import {compose, branch, renderComponent, withProps} from 'recompose';
import {createSelector} from 'reselect';
import {createAction} from 'redux-actions';
import {createAsyncAction, idOfAction} from 'redux-saga-mate';
import Placeholder from '../../components/TodoList/Placeholder';
import Loading from '../../components/TodoList/Loading';
import NoData from '../../components/TodoList/NoData';
import DataRows from '../../components/TodoList/DataRows';
import {mapAsyncActionProps, withAsyncActionContextConsumer} from './actions';
import {selectTodos, selectTodosBuffer, selectTransientOfOnPage, selectTransientOfOnStar} from './selectors';
import * as ActionTypes from '../../actions/types';

const makeSelectProps = () => createSelector(
    selectTodos,
    selectTodosBuffer,
    selectTransientOfOnPage,
    selectTransientOfOnStar,
    (items, buffer, onPageTransient, onStarTransient) => ({
        items,
        buffer,
        onPageTransient,
        onStarTransient,
    }),
);

const makeMapStateToProps = () => {
    const selectProps = makeSelectProps();
    return (state, props) => selectProps(state, props);
};

const mapDispatchToProps = (dispatch, {
    onTrackAsyncAction,
    onViewAuthor,
    onUntrackAsyncAction,
    actionIds,
}) => ({
    onStar: id => {
        const action = dispatch(createAsyncAction(ActionTypes.ASYNC_PATCH_ONE_TODO)({id}));
        onTrackAsyncAction(['onStar', id], idOfAction(action));
    },
    onViewAuthor: id => {
        const action = dispatch(createAsyncAction(ActionTypes.ASYNC_GET_ONE_USER_BY_TODO_ID)({
            todoId: id,
        }));
        onTrackAsyncAction('onViewAuthor', idOfAction(action));
        onViewAuthor(id);
    },
    onClearStarLoading: id => {
        onUntrackAsyncAction(['onStar', id]);
        dispatch(createAction(ActionTypes.CLEANUP)(actionIds.onStar[id]));
    },
});

const withRedux = connect(makeMapStateToProps, mapDispatchToProps);

const maybePlaceholder = branch(
    ({items, onPageTransient}) => (!items && !onPageTransient),
    renderComponent(Placeholder),
);

const maybeLoading = branch(
    ({items, onPageTransient}) => (!items && onPageTransient && onPageTransient.isLoading),
    renderComponent(Loading),
);

const maybeNoData = branch(
    ({items, onPageTransient}) => (!items && onPageTransient && !onPageTransient.isLoading),
    renderComponent(NoData),
);

const maybeNotDataRows = compose(maybeNoData, maybePlaceholder, maybeLoading);

export default compose(
    withAsyncActionContextConsumer,
    withProps(mapAsyncActionProps),
    withRedux,
    maybeNotDataRows,
)(DataRows);
