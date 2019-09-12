/* global window */
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom'
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

const mapDispatchToProps = (dispatch, props) => {
    // console.log(props);
    return {
        onPage: page => {
            const actionId = idOfAction(dispatch(createAsyncAction(ActionTypes.ASYNC_GET_MANY_TODO)({
                page,
            })));
            props.onTrackAsyncAction(['onPage', page], actionId);
        },
        onCloseAuthorModal: () => {
            props.setModalTodoAuthor(undefined);
        },
        onBatchStar: () => {
            props.selected.forEach(id => {
                const actionId = idOfAction(dispatch(createAsyncAction(ActionTypes.ASYNC_PATCH_ONE_TODO)({id})));
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
            props.setModalTodoAuthor(id);
        },
    };
};

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
