/* global window */
import store from 'store';
import history from './history';
import {LOCAL_STORAGE_PATH_BEFORE_404} from './config';

const {href, pathname} = window.location;

const regex = new RegExp(`^${ENV_PUBLIC_URL}`);

const to = (ENV_PUBLIC_URL.startsWith('http') ? href : pathname).replace(regex, '');

store.set(LOCAL_STORAGE_PATH_BEFORE_404, to);

window.location.href = ENV_PUBLIC_URL;
