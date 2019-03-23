import store from 'store';
import history from './history';
import {LOCAL_STORAGE_PATH_BEFORE_404} from './config';

export default () => {
    const last = store.get(LOCAL_STORAGE_PATH_BEFORE_404);

    if (last) {
        history.replace(last);
        store.remove(LOCAL_STORAGE_PATH_BEFORE_404);
    }
};
