import {compose, withProps, withStateHandlers} from 'recompose';
import identity from 'ramda/src/identity';
import set from 'ramda/src/set';
import lensPath from 'ramda/src/lensPath';

export const withAsyncActionStateHandler = (mapToProps = identity) => compose(
    withStateHandlers(
        () => ({actionIds: {}}),
        {
            setActionId: (state, props) => (key, actionId) => {
                const lens = Array.isArray(key) ? lensPath(['actionIds', ...key]) : lensPath(['actionIds', key]);
                return set(lens, actionId, state);
            },
            unsetActionId: (state, props) => key => {
                const lens = Array.isArray(key) ? lensPath(['actionIds', ...key]) : lensPath(['actionIds', key]);
                return set(lens, undefined, state);
            },
        }
    ),
    withProps(mapToProps),
);
