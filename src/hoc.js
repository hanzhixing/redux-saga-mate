import {withStateHandlers} from 'recompose';
import set from 'ramda/src/set';
import lensPath from 'ramda/src/lensPath';

export const withAsyncActionTrack = withStateHandlers(
    () => ({actionIds: {}}),
    {
        onTrackAsyncAction: (state, props) => (key, actionId) => {
            const lens = Array.isArray(key) ? lensPath(['actionIds', ...key]) : lensPath(['actionIds', key]);
            return set(lens, actionId, state);
        },
        onUntrackAsyncAction: (state, props) => key => {
            const lens = Array.isArray(key) ? lensPath(['actionIds', ...key]) : lensPath(['actionIds', key]);
            return set(lens, undefined, state);
        },
    }
);
