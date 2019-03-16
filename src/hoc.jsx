import {createContext} from 'react';
import {compose, withProps, withStateHandlers, renderComponent, wrapDisplayName} from 'recompose';
import identity from 'ramda/src/identity';
import set from 'ramda/src/set';
import lensPath from 'ramda/src/lensPath';

const withStates = withStateHandlers(
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
);

export const withAsyncActionStateHandler = (mapToProps = identity) => compose(
    withStates,
    withProps(mapToProps),
);

export const createAsyncActionContext = () => {
    const {Provider, Consumer} = createContext(undefined);

    const withAsyncActionContextProvider = ComponentIn => {
        const ComponentOut = ({actionIds, setActionId, unsetActionId, ...rest}) => (
            <Provider value={{actionIds, setActionId, unsetActionId}}>
                <ComponentIn {...rest} />
            </Provider>
        );

        ComponentOut.displayName = wrapDisplayName(ComponentIn, 'withAsyncActionContextProvider');

        return withStates(ComponentOut);
    };

    const withAsyncActionContextConsumer = ComponentIn => {
        const ComponentOut = props => (
            <Consumer>
                {
                    context => (
                        <ComponentIn {...props} {...context} />
                    )
                }
            </Consumer>
        );

        ComponentOut.displayName = wrapDisplayName(ComponentIn, 'withAsyncActionContextConsumer');

        return ComponentOut;
    };

    return {
        withAsyncActionContextProvider,
        withAsyncActionContextConsumer,
    };
};
