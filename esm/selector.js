import { createSelector } from 'reselect';
import prop from 'ramda/src/prop';
import keys from 'ramda/src/keys';
import omit from 'ramda/src/omit';
import set from 'ramda/src/set';
import lensProp from 'ramda/src/lensProp';
import { isFinished } from './action';
export var selectActions = createSelector([prop('actions'), function (state, props) {
  return props.actionIds;
}], function (actions, actionIds) {
  var reduceRecursively = function reduceRecursively(actionIds) {
    return keys(actionIds).reduce(function (acc, id) {
      if (!actionIds[id]) {
        return acc;
      }

      if (typeof actionIds[id] === 'string') {
        if (!actions[actionIds[id]]) {
          return acc;
        }

        var action = actions[actionIds[id]];
        return set(lensProp(id), omit(['type', 'meta'], set(lensProp('isLoading'), !isFinished(action), action)), acc);
      }

      return set(lensProp(id), reduceRecursively(actionIds[id]), acc);
    }, {});
  };

  return reduceRecursively(actionIds);
});