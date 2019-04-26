import {createSelector} from 'reselect';
import {get} from 'lodash/fp';
import {createSelectActions} from 'redux-saga-mate';

export const selectTodoIds = (state, props) => get(['ui', 'todos', props.page, 'ids'], state);
export const selectBufferTodoIds = (state, props) => get(['ui', 'todos', props.page, 'buffer'], state);
export const selectModalTodo = (state, props) => get([props.modalTodoAuthor], state.entities.todos);

export const selectUsers = (state, props) => state.entities.users;

export const selectTodos = createSelector(
    (state, props) => state.entities.todos,
    selectTodoIds,
    selectUsers,
    (todos, ids, users) => {
        if (ids) {
            return ids.map(id => ({
                ...todos[String(id)],
                author: users[todos[String(id)].author].name,
            }));
        }
        return undefined;
    },
);

export const selectTodosBuffer = createSelector(
    selectBufferTodoIds,
    selectTodoIds,
    (buffer, ids) => {
        if (!buffer || !ids) {
            return [];
        }
        return buffer.filter(id => !ids.includes(id));
    },
);

export const selectActions = createSelectActions(
    get('actions'),
    (state, props) => props.actionIds,
);

export const selectModalAuthor = createSelector(
    selectModalTodo,
    selectUsers,
    selectActions,
    (todo, users, actions) => {
        const {isLoading} = actions.onViewAuthor ? actions.onViewAuthor : {isLoading: undefined};

        if (isLoading) {
            return {isLoading};
        }

        return {
            isLoading,
            ...todo ? get([todo.author], users) : {},
        };
    },
);

export const selectTransientOfOnPage = createSelector(
    selectActions,
    (state, props) => props.page,
    (actions, page) => {
        if (!actions.onPage || !actions.onPage[page]) {
            return undefined;
        }
        return actions.onPage[page];
    }
);

export const selectTransientOfOnStar = createSelector(
    selectActions,
    actions => {
        if (!actions.onStar || !actions.onStar) {
            return undefined;
        }
        return actions.onStar;
    }
);
