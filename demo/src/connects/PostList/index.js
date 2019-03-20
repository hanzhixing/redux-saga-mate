import {connect} from 'react-redux';
import {compose, lifecycle, withState, withProps} from 'recompose';
import {createSelector} from 'reselect';
import {createAsyncAction, idOfAction} from 'redux-saga-mate';
import {delay} from '../../utils';
import PostList from '../../components/PostList';
import {
    withAsyncActionContextProvider,
    withAsyncActionContextConsumer,
    mapAsyncActionProps,
} from './actions';
import {selectActions, selectPosts, selectPostsBuffer, selectModalAuthor} from './selectors';
import * as ActionTypes from '../../actions/types';

const makeSelectProps = () => createSelector(
    selectPosts,
    selectPostsBuffer,
    selectActions,
    selectModalAuthor,
    (posts, buffer, transients, modalAuthorInfo) => ({
        items: posts,
        buffer,
        transients,
        modalAuthorInfo,
    }),
);

const makeMapStateToProps = () => {
    const selectProps = makeSelectProps();
    return (state, props) => selectProps(state, props);
};

const mapDispatchToProps = (dispatch, props) => ({
    onPage: page => {
        props.setPage(page);
        const actionId = idOfAction(dispatch(createAsyncAction(ActionTypes.ASYNC_GET_MANY_POST)({
            page,
        })));
        props.onTrackAsyncAction(['onPage', page], actionId);
    },
    onCloseAuthorModal: () => {
        props.setModalPostAuthor(undefined);
    },
    onBatchStar: () => {
        props.selected.forEach(id => {
            const actionId = idOfAction(dispatch(createAsyncAction(ActionTypes.ASYNC_PATCH_ONE_POST)({id})));
            props.onTrackAsyncAction(['onStar', id], actionId);
        });
    },
    onToggleCheck: id => {
        if (props.selected.includes(id)) {
            props.setSelected(props.selected.filter(item => item !== id));
        } else {
            props.setSelected([...props.selected, id]);
        }
    },
    onViewAuthor: id => {
        props.setModalPostAuthor(id);
    },
});

const withRedux = connect(makeMapStateToProps, mapDispatchToProps);

const withLifecycle = lifecycle({
    componentDidMount() {
        this.controller = new AbortController();

        delay(2, this.controller.signal).then(() => (this.props.onPage(1)));
    },
    componentWillUnmount() {
        this.controller.abort();
    },
});

const withLiftedStates = compose(
    withState('selected', 'setSelected', []),
    withState('page', 'setPage', 1),
    withState('modalPostAuthor', 'setModalPostAuthor', undefined),
);

// const withAsyncAction = withAsyncActionStateHandler(({actionIds, setActionId, unsetActionId}) => ({
//     actionIds,
//     onTrackAsyncAction: setActionId,
//     onUntrackAsyncAction: unsetActionId,
// }));

// export default compose(withLiftedStates, withAsyncAction, withRedux, withLifecycle)(PostList);

export default compose(
    withLiftedStates,
    withAsyncActionContextProvider,
    withAsyncActionContextConsumer,
    withProps(mapAsyncActionProps),
    withRedux,
    withLifecycle,
)(PostList);
