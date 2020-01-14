/* global window */
import {createStore, applyMiddleware} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../sagas';
import rootReducer from '../reducers';

export default (initialState = undefined, storeName = undefined, LS_KEY = 'REDUX-STORE') => {
    let preloadedState;

    try {
        window.localStorage.setItem(LS_KEY, JSON.stringify({}));

        preloadedState = initialState
            || JSON.parse(window.localStorage.getItem(LS_KEY))
            || undefined;
    } catch (e) {
        console.warn('The JSON data in Local Storage seems broken!');
        preloadedState = undefined;
    }

    const composeEnhancers = composeWithDevTools({name: storeName});

    const sagaMiddleware = createSagaMiddleware();

    const store = createStore(
        rootReducer,
        preloadedState,
        composeEnhancers(applyMiddleware(
            sagaMiddleware,
        )),
    );

    sagaMiddleware.run(rootSaga);

    store.subscribe(() => window.localStorage.setItem(LS_KEY, JSON.stringify(store.getState())));

    if (module.hot) {
        module.hot.accept('../reducers', () => store.replaceReducer(rootReducer));
    }

    return store;
};
