import {createSelector} from 'reselect';
import {get} from 'lodash/fp';
import {createSelectActions} from 'redux-saga-mate/src/selector';

export const selectPostIds = (state, props) => get(['ui', 'posts', props.page, 'ids'], state);
export const selectBufferPostIds = (state, props) => get(['ui', 'posts', props.page, 'buffer'], state);
export const selectModalPost = (state, props) => get([props.modalPostAuthor], state.entities.posts);

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

export const selectActions = createSelectActions(
    get('actions'),
    (state, props) => props.actionIds,
);

export const selectModalAuthor = createSelector(
    selectModalPost,
    selectUsers,
    selectActions,
    (post, users, actions) => {
        const {isLoading} = actions.onViewAuthor ? actions.onViewAuthor : {isLoading: undefined};

        if (isLoading) {
            return {isLoading};
        }

        return {
            isLoading,
            ...post ? get([post.author], users) : {},
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
