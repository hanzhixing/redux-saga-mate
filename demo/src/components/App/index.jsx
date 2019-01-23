import React from 'react';
import {Provider} from 'react-redux';
import store from '../../store';
import PostList from '../../connects/PostList';

export default () => (
    <Provider store={store}>
        <div><PostList /></div>
    </Provider>
);
