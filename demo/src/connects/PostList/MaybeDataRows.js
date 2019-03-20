import {connect} from 'react-redux';
import {compose, branch, renderComponent, withProps} from 'recompose';
import {createSelector} from 'reselect';
import {createAction} from 'redux-actions';
import {createAsyncAction, idOfAction} from 'redux-saga-mate';
import Placeholder from '../../components/PostList/Placeholder';
import Loading from '../../components/PostList/Loading';
import NoData from '../../components/PostList/NoData';
import DataRows from '../../components/PostList/DataRows';
import {mapAsyncActionProps, withAsyncActionContextConsumer} from './actions';
import {selectPosts, selectPostsBuffer, selectTransientOfOnPage, selectTransientOfOnStar} from './selectors';
import * as ActionTypes from '../../actions/types';

const makeSelectProps = () => createSelector(
    selectPosts,
    selectPostsBuffer,
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

const mapDispatchToProps = (dispatch, props) => ({
    onStar: id => {
        const actionId = idOfAction(dispatch(createAsyncAction(ActionTypes.ASYNC_PATCH_ONE_POST)({id})));
        props.onTrackAsyncAction(['onStar', id], actionId);
    },
    onViewAuthor: id => {
        const actionId = idOfAction(dispatch(createAsyncAction(ActionTypes.ASYNC_GET_ONE_USER_BY_POST_ID)({
            postId: id,
        })));
        props.onTrackAsyncAction('onViewAuthor', actionId);
        props.onViewAuthor(id);
    },
    onClearStarLoading: id => {
        props.onUntrackAsyncAction(['onStar', id]);
        dispatch(createAction(ActionTypes.CLEANUP)(props.actionIds.onStar[id]));
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
