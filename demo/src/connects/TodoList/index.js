/* global window */
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {compose, lifecycle, withState, withProps} from 'recompose';
import {createSelector} from 'reselect';
import {createAsyncAction, idOfAction} from 'redux-saga-mate';
import {delay} from '../../utils';
import TodoList from '../../components/TodoList';
import {withAsyncActionContextProvider, withAsyncActionContextConsumer, mapAsyncActionProps} from './actions';
import {selectActions, selectTodos, selectTodosBuffer, selectModalAuthor} from './selectors';
import * as ActionTypes from '../../actions/types';

const {AbortController} = window;

const makeMapStateToProps = () => createSelector(
    selectTodos,
    selectTodosBuffer,
    selectActions,
    selectModalAuthor,
    (state, props) => props.page,
    (todos, buffer, transients, modalAuthorInfo, page) => ({
        page: Number(page),
        items: todos,
        buffer,
        transients,
        modalAuthorInfo,
    }),
);

const mapDispatchToProps = (dispatch, {
    onTrackAsyncAction,
    setModalTodoAuthor,
    selected,
    setSelected,
}) => ({
    onPage: page => {
        const action = dispatch(createAsyncAction(ActionTypes.ASYNC_GET_MANY_TODO)({page}));
        onTrackAsyncAction(['onPage', page], idOfAction(action));
    },
    onCloseAuthorModal: () => {
        setModalTodoAuthor(undefined);
    },
    onBatchStar: () => {
        selected.forEach(id => {
            const action = dispatch(createAsyncAction(ActionTypes.ASYNC_PATCH_ONE_TODO)({id}));
            onTrackAsyncAction(['onStar', id], idOfAction(action));
        });
    },
    onToggleCheck: id => {
        if (selected.includes(id)) {
            setSelected(selected.filter(item => item !== id));
        } else {
            setSelected([...selected, id]);
        }
    },
    onViewAuthor: id => {
        setModalTodoAuthor(id);
    },
});

const withRedux = connect(makeMapStateToProps, mapDispatchToProps);

const withLifecycle = lifecycle({
    componentDidMount() {
        this.controller = new AbortController();

        const {page, onPage} = this.props;

        delay(0, this.controller.signal).then(() => (onPage(page)));
    },
    componentDidUpdate(prevProps) {
        const {page, onPage} = this.props;

        if (prevProps.page === page) {
            return;
        }

        delay(0, this.controller.signal).then(() => (onPage(page)));
    },
    componentWillUnmount() {
        this.controller.abort();
    },
});

const withLiftedStates = compose(
    withState('selected', 'setSelected', []),
    withState('modalTodoAuthor', 'setModalTodoAuthor', undefined),
);

export default withRouter(compose(
    withLiftedStates,
    withAsyncActionContextProvider,
    withAsyncActionContextConsumer,
    withProps(mapAsyncActionProps),
    withRedux,
    withLifecycle,
)(TodoList));
