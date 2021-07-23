import {createSelector} from 'reselect';
import {keys, omit, set, lensProp} from 'ramda';
import {isFinished} from './action';

export const createSelectActions = (selectActions, selectActionIds) => createSelector(
    [selectActions, selectActionIds],
    (actions, actionIds) => {
        const reduceRecursively = function reduceRecursively(nextActionIds) {
            return keys(nextActionIds).reduce((acc, id) => {
                if (typeof nextActionIds[id] === 'string') {
                    if (!actions[nextActionIds[id]]) {
                        return acc;
                    }

                    const action = actions[nextActionIds[id]];

                    return set(
                        lensProp(id),
                        omit(['type', 'meta'], set(lensProp('isLoading'), !isFinished(action), action)),
                        acc,
                    );
                }
                return set(lensProp(id), reduceRecursively(nextActionIds[id]), acc);
            }, {});
        };

        return reduceRecursively(actionIds);
    },
);
