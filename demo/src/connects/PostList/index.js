import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom'
import {compose, lifecycle, withState, withProps} from 'recompose';
import {createSelector} from 'reselect';
import {createAsyncAction, idOfAction} from 'redux-saga-mate';
import {delay} from '../../utils';
import PostList from '../../components/PostList';
import {withAsyncActionContextProvider, withAsyncActionContextConsumer, mapAsyncActionProps} from './actions';
import {selectActions, selectPosts, selectPostsBuffer, selectModalAuthor} from './selectors';
import * as ActionTypes from '../../actions/types';

const makeMapStateToProps = () => createSelector(
    selectPosts,
    selectPostsBuffer,
    selectActions,
    selectModalAuthor,
    (state, props) => props.page,
    (posts, buffer, transients, modalAuthorInfo, page) => ({
        page: Number(page),
        items: posts,
        buffer,
        transients,
        modalAuthorInfo,
    }),
);

const mapDispatchToProps = (dispatch, props) => {
    // console.log(props);
    return {
        onPage: page => {
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
    };
};

const withRedux = connect(makeMapStateToProps, mapDispatchToProps);

const withLifecycle = lifecycle({
    componentDidMount() {
        this.controller = new AbortController();

        const {page, onPage} = this.props;

        delay(2, this.controller.signal).then(() => (onPage(page)));
    },
    componentDidUpdate(prevProps) {
        const {page, onPage} = this.props;

        if (prevProps.page === page) {
            return;
        }

        delay(2, this.controller.signal).then(() => (onPage(page)));
    },
    componentWillUnmount() {
        this.controller.abort();
    },
});

const withLiftedStates = compose(
    withState('selected', 'setSelected', []),
    withState('modalPostAuthor', 'setModalPostAuthor', undefined),
);

export default withRouter(compose(
    withLiftedStates,
    withAsyncActionContextProvider,
    withAsyncActionContextConsumer,
    withProps(mapAsyncActionProps),
    withRedux,
    withLifecycle,
)(PostList));
