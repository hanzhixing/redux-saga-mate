import {createSelector} from 'reselect';
import {get} from 'lodash/fp';
import {selectActions} from 'redux-saga-mate/lib/selector';

export const selectPostIds = (state, props) => get(['ui', 'posts', props.page, 'ids'], state);
export const selectBufferPostIds = (state, props) => get(['ui', 'posts', props.page, 'buffer'], state);

export const selectUsers = (state, props) => state.entities.users;

export const selectPosts = createSelector(
    (state, props) => state.entities.posts,
    selectPostIds,
    selectUsers,
    (posts, ids, users) => {
        if (ids) {
            return ids.map(id => ({
                ...posts[String(id)],
                author: users[posts[String(id)].author].fullName,
            }));
        }
        return undefined;
    },
);

export const selectPostsBuffer = createSelector(
    selectBufferPostIds,
    selectPostIds,
    (buffer, ids) => {
        if (!buffer || !ids) {
            return [];
        }
        return buffer.filter(id => !ids.includes(id));
    },
);

export const selectModalAuthor = createSelector(
    selectActions,
    actions => {
        if (!actions.onViewAuthor) {
            return undefined;
        }
        const {isLoading} = actions.onViewAuthor;

        if (isLoading) {
            return {isLoading};
        }

        const {response: {result, entities: {users}}} = actions.onViewAuthor.payload;

        return {
            isLoading,
            ...users[result]
        };
    },
);

export const selectTransientOfOnPage = createSelector(
    (state, props) => props.transients,
    (state, props) => props.page,
    (transients, page) => {
        if (!transients.onPage || !transients.onPage[page]) {
            return undefined;
        }
        return transients.onPage[page];
    }
);

export const selectTransientOfOnStar = createSelector(
    (state, props) => props.transients,
    transients => {
        if (!transients.onStar || !transients.onStar) {
            return undefined;
        }
        return transients.onStar;
    }
);
