# Redux Saga Mate

Allow you building react and redux based web apps with less pain, by removing the needs for writing lots of action types, reducers.

## You should know before go on reading
### Layers or Moments
```bash
 -----------------------------------------------------------------------------------
|                             presentational components (UI, jsx)                   |       ^
 -----------------------------------------------------------------------------------        |
|                                container components (auto)                        |       |
 -----------------------------------------------------------------------------------        |
|               connects (react-redux connect() or recompose hoc) (js)              |       |
 -----------------------------------------------------------------------------------        |
|                                     selectors (js)                                |       |
 -----------------------------------------------------------------------------------        |
|                                redux store (state) (js)                           |       |
 -----------------------------------------------------------------------------------        |
|                                  redux reducers (js)                              |       |
 -----------------------------------------------------------------------------------    data flow
|                               redux action payloads (js)                          |       ^
 -----------------------------------------------------------------------------------        |
|                           front-end states normalization (js)                     |       |
 -----------------------------------------------------------------------------------        |
|                                  remote API calls (js)                            |       |
 -----------------------------------------------------------------------------------        |
|  Web API, WebSocket Endpoints (we do not know where the data come from) (unknown) |       |
 -----------------------------------------------------------------------------------        |
|            Server State (RDBMS, No-SQL, MQs, Cache, File, Calculated) (unknown)   |       |
 -----------------------------------------------------------------------------------
```

* `dispatch`, `action`, `reducer`, `store` are concepts from the design of redux, you should never try to put these things in your UI layer.
* `action`s are about what happend, it's not about "what should be done", even if they were named in verbs.
* It is `reducer`s' job, that about "what should be done" and "how it should be done".
* The `container` files you put in the "containers" directory are not actual `container`s, they are just connecting logics, the actual `container`s created automatically by `connect(YourComponent)`, you can only see them in the browser's `Developer Tools`.
* In most situations, you should try hard to prevent putting JSX codes in the `container` files. Because they are about the UI.
* `redux-thunk` changes the origin conceptual model of the `action`, by functions, and functions always about "what should be done", or "how it should be done".
* The `action` is not equal to action types. **`Action Type` + `Action Payload` = `Action Instance`**.
* Tutorials or documentations of `redux`, `redux-thunk`, `redux-saga`, tell you track the async action state **`by action type`**, this is not what you want, in most of the time.
* Actions you dispatch are always with payloads. Infomations in the payload affect the final call like http requests, and so the responses.
* Track async action states in `store`, it also means your components are fully **`controlled components`**, the states and callbacks(handlers) are all passed as props.
* Infomation synchronisation is the most difficult part in the computer science, `normalization` strategy is mean to solve this problem, even if that may not work perfectly. I hope you know how to use the `normalizr` library.

## Demo
https://hanzhixing.github.io/redux-saga-mate/

## Installation

Install the package.To use with node:

```bash
$ npm install redux-saga-mate --save
```

Install peer dependencies, you may already have these be installed.
```bash
npm install react redux redux-saga recompose reselect redux-actions
```

## Recommended directory structure
```bash
src/
├── actions
│   └── types.js
├── api
│   └── index.js
├── components
│   ├── App
│   │   └── index.jsx
│   └── PostList
│       ├── index.jsx
│       └── index.module.scss
├── config.js
├── connects
│   └── PostList
│       ├── index.js
│       └── selectors.js
├── index.css
├── index.js
├── reducers
│   ├── index.js
│   └── ui
│       ├── index.js
│       └── posts.js
├── sagas
│   └── index.js
├── store
│   ├── configureStore.js
│   └── index.js
└── utils
    └── index.js
```

## Recommended state shape
```bash
{
    session: {            <--- current session based infomations
        username: ...,
    },
    entities: {           <--- normalized entities, again, learn to use the normalizr library
        posts: {
            1: {
                ...
            }
            2: {
                ...
            }
        }
    },
    ui: {                 <--- relation infomations between the entities and the UI.
        home: {
            latestPosts: {
                ...
            }
        }
    }
    actions: {            <--- all action infomations
    }
}
```
## Something about internal implementation
### Action (enhanced FSA for async)
```js
{
    type: 'YOUR_ACTION_TYPE',
    payload: {...any infomation as object...},
    error: true or false,
    meta: { // this infomation will be managed automatically
        id: uniq_hash(type + payload),
        pid: parentOf(id), // not used yet
        ctime: ISO8601,
        utime: ISO8601,
        phase: 'started'|'running'|'finished',
        progress: integer between 1~100

    }
}
```

### Normalized payloads

You must normalized your api data in the API layer, then it can be processed automatically.

```js
{
    request: {
        data: {...},    // for POST, PUT, PATCH body (should be plain object)
        params: {...},  // hint: react-router params
        query: {...},   // hint: querystring.parse(location.search)
    },
    response: {
        ...normalize(data, schema), // see normalizr
    }
}
```

## Usage (Highly recommended you to read the source of demo)

### actions/type.js
```js
export const CLEANUP = 'CLEANUP';
// You need not split this to ASYNC_GET_MANY_POST_REQUEST, ASYNC_GET_MANY_POST_SUCCESS, ASYNC_GET_MANY_POST_FAILURE
export const ASYNC_GET_MANY_POST = 'ASYNC_GET_MANY_POST';
```

### api/index.js
Normalize your data in the API layer. It's the only right place.
```js
export const restfulGetManyPosts = args => fetch(...).then(data => normalize(data, YOUR_SCHEMA))
```

### reducers/index.js
```js
import {combineReducers} from 'redux';
import {concat, difference} from 'lodash/fp';
import {createActionsReducer, createEntitiesReducer, groupByComposeByEntityType} from 'redux-saga-mate/src/reducer';
// there are only these two operations for state updating.
import {UPDATE, DELETE} from 'redux-saga-mate/src/operation';
import * as ActionTypes from '../actions/types'; // It's ok, if you want to import action types explicitly.

// The keys is your entities keys in the store.
const EntityActionMap = {
    posts: {
        // the value part can be one single OPERATION(string), or tuple [OPERATION, yourMergeFunction]
        [ActionTypes.ASYNC_GET_MANY_POST]: [
            UPDATE,
            // @see the 'mergeDeepWith' from 'ramda'
            (k, l, r) => (k === 'commenters' ? concat(l, difference(r, l)) : r),
        ],
        [ActionTypes.ASYNC_DELETE_ONE_POST]: DELETE,
        [ActionTypes.ASYNC_PATCH_ONE_POST]: UPDATE,
        ...
    },
    users: {
        ...
    },
    ...
    // add your mapping rules instead of writing reducers
};

export default combineReducers({
    // tuple [ACTION_TYPE_FOR_CLEANUP, YOUR_ASYNC_ACTION_TYPE_REGEX]
    actions: createActionsReducer([ActionTypes.CLEANUP, /^ASYNC_/]),
    entities: combineReducers(
        groupByComposeByEntityType(
            createEntitiesReducer(EntityActionMap),
            {
               ...
               /// put your own legacy reducers here, they will executed at the end of reducing
               ...
            },
        ),
    ),
    ...
    // If you are creating new app, codes above can be written like bellow
    entities: createEntitiesReducer(EntityActionMap),
    ...
});
```

### sagas/index.js
```js
import {all, takeEvery} from 'redux-saga/effects';
import {makeCreateDefaultWorker} from 'redux-saga-mate/src/saga';
import * as ActionTypes from '../actions/types';
import * as Api from '../api';

// you need to tell the Error Type for failure situation of the async action.
const createDefaultWorker = makeCreateDefaultWorker(Error);

// Notice!
// If you need more complicated logic controls then the default worker saga,
// you need to implement your own worker sagas.
export default function* () {
    yield all([
        // create a worker saga with your remote call promise, you need only one line code.
        takeEvery(ActionTypes.ASYNC_GET_MANY_POST, createDefaultWorker(Api.restfulGetManyPosts)),
        // If you need infomations from state, before run the promise, you can prepare the payload.
        // What you return will pass in to the remote call.
        takeEvery(ActionTypes.ASYNC_GET_ONE_USER_BY_POST_ID, createDefaultWorker(
            Api.getOneUser,
            (state, action) => {
                const {postId} = action.payload;
                const {author} = state.entities.posts[postId];
                return {id: author};
            }
        )),
    ]);
}
```

### connects/PostList/index.js (or containers/PostList/index.js)
```js
import {connect} from 'react-redux';
import {compose, lifecycle, withState} from 'recompose';
import {createSelector} from 'reselect';
import {createAction} from 'redux-actions';
import {createAsyncAction, idOfAction} from 'redux-saga-mate/src/action';
import {withAsyncActionStateHandler} from 'redux-saga-mate/src/hoc';
import {createSelectActions} from 'redux-saga-mate/src/selector';
import PostList from '../../components/PostList';
import {selectPosts, selectPostsBuffer, selectModalAuthor} from './selectors';
import * as ActionTypes from '../../actions/types';

const selectActions = createSelectActions(
    (state, props) => state.actions, // provide actions selector from store
    (state, props) => props.actionIds, // provide actionIds selector maybe from props
);

const makeSelectProps = () => createSelector(
    selectPosts,
    selectActions, // Once your component is wrapped with 'withAsyncActionStateHandler`, you can select out the actions
    (items, transients) => ({
        items: posts,
        transients, // in the ui component, you can examine the action by 'transients.onPage[page]'
        ....
    }),
);

const makeMapStateToProps = () => {
    const selectProps = makeSelectProps();
    return (state, props) => selectProps(state, props);
};

const mapDispatchToProps = (dispatch, props) => ({
    onPage: page => {
        // 1. Make your action Async with 'createAsyncAction'.
        // 2. dispatch it.
        // 3. take the action id with 'idOfAction'
        const actionId = idOfAction(dispatch(createAsyncAction(ActionTypes.ASYNC_GET_MANY_POST)({
            page,
        })));
        // you can pass single string, or path in array form for the first argument
        // Seconds is the Action Id.
        props.onTrackAsyncAction(['onPage', page], actionId);
    },
});

const withRedux = connect(makeMapStateToProps, mapDispatchToProps);

const withAsyncAction = withAsyncActionStateHandler(({actionIds, setActionId, unsetActionId}) => ({
    actionIds,
    onTrackAsyncAction: setActionId,
    onUntrackAsyncAction: unsetActionId,
}));

export default compose(
    ...
    withAsyncAction,
    withRedux,
    ...
)(PostList);
```
