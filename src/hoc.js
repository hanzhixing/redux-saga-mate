import {createElement, createContext} from 'react';
import {compose, identity, set, lensPath, dissocPath} from 'ramda';
import {withProps, withStateHandlers, wrapDisplayName} from 'recompose';

const withStates = withStateHandlers(
    () => ({actionIds: {}}),
    {
        setActionId: state => (key, actionId) => {
            const lens = (
                Array.isArray(key)
                    ? lensPath(['actionIds', ...key])
                    : lensPath(['actionIds', key])
            );
            return set(lens, actionId, state);
        },
        unsetActionId: state => key => {
            const path = Array.isArray(key) ? ['actionIds', ...key] : ['actionIds', key];
            return dissocPath(path, state);
        },
    },
);

export const withAsyncActionStateHandler = (mapToProps = identity) => compose(
    withStates,
    withProps(mapToProps),
);

export const createAsyncActionContext = () => {
    const {Provider, Consumer} = createContext(undefined);

    const withAsyncActionContextProvider = ComponentIn => {
        const ComponentOut = ({actionIds, setActionId, unsetActionId, ...rest}) => createElement(
            Provider,
            {value: {actionIds, setActionId, unsetActionId}},
            createElement(ComponentIn, rest),
        );

        ComponentOut.displayName = wrapDisplayName(ComponentIn, 'withAsyncActionContextProvider');

        return withStates(ComponentOut);
    };

    const withAsyncActionContextConsumer = ComponentIn => {
        const ComponentOut = props => createElement(
            Consumer,
            null,
            context => createElement(
                ComponentIn,
                {...props, ...context},
            ),
        );

        ComponentOut.displayName = wrapDisplayName(ComponentIn, 'withAsyncActionContextConsumer');

        return ComponentOut;
    };

    return {
        withAsyncActionContextProvider,
        withAsyncActionContextConsumer,
    };
};
