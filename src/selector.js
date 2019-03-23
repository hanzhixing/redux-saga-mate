import {createSelector} from 'reselect';
import prop from 'ramda/src/prop';
import keys from 'ramda/src/keys';
import omit from 'ramda/src/omit';
import set from 'ramda/src/set';
import lensProp from 'ramda/src/lensProp';
import {isFinished} from './action';

export const createSelectActions = (selectActions, selectActionIds) => createSelector(
    [selectActions, selectActionIds],
    (actions, actionIds) => {
        const reduceRecursively = function reduceRecursively(actionIds) {
            return keys(actionIds).reduce((acc, id) => {
                if (typeof actionIds[id] === 'string') {
                    if (!actions[actionIds[id]]) {
                        return acc;
                    }

                    const action = actions[actionIds[id]];

                    return set(
                        lensProp(id),
                        omit(['type', 'meta'], set(lensProp('isLoading'), !isFinished(action), action)),
                        acc,
                    );
                }
                return set(lensProp(id), reduceRecursively(actionIds[id]), acc);
            }, {});
        };
        return reduceRecursively(actionIds);
    },
);
