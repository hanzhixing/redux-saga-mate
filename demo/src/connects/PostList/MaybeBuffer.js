import {connect} from 'react-redux';
import {compose, branch, renderComponent, withProps} from 'recompose';
import {createSelector} from 'reselect';
import {createAction} from 'redux-actions';
import LoadingBuffer from '../../components/PostList/LoadingBuffer';
import Buffer from '../../components/PostList/Buffer';
import Empty from '../../components/PostList/Empty';
import {mapAsyncActionProps, withAsyncActionContextConsumer} from './actions';
import {selectPosts, selectPostsBuffer, selectTransientOfOnPage} from './selectors';
import * as ActionTypes from '../../actions/types';

const makeSelectProps = () => createSelector(
    selectPosts,
    selectPostsBuffer,
    selectTransientOfOnPage,
    (items, buffer, onPageTransient) => ({
        items,
        buffer,
        onPageTransient,
    }),
);

const makeMapStateToProps = () => {
    const selectProps = makeSelectProps();
    return (state, props) => selectProps(state, props);
};

const mapDispatchToProps = (dispatch, props) => ({
    onAccept: () => {
        dispatch(createAction(ActionTypes.ACCEPT_UPDATE_POST_LIST)({page: props.page}));
    },
});

const withRedux = connect(makeMapStateToProps, mapDispatchToProps);

const maybeBufferLoading = branch(
    ({items, buffer, onPageTransient}) => (
        items && onPageTransient && onPageTransient.isLoading
    ),
    renderComponent(LoadingBuffer),
);

const maybeNothing = branch(
    ({items, buffer, onPageTransient}) => (
        !items
            || (items && !buffer.length && !onPageTransient)
            || (items && onPageTransient && !onPageTransient.isLoading && !buffer.length)
    ),
    renderComponent(Empty),
);

const maybeNotBuffer = compose(
    maybeBufferLoading,
    maybeNothing,
);

export default compose(
    withAsyncActionContextConsumer,
    withProps(mapAsyncActionProps),
    withRedux,
    maybeNotBuffer
)(Buffer);
