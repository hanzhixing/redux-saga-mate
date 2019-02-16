import {createAsyncActionContext} from 'redux-saga-mate/src/hoc';

export const {
    withAsyncActionContextProvider,
    withAsyncActionContextConsumer,
} = createAsyncActionContext();

export const mapAsyncActionProps = ({actionIds, setActionId, unsetActionId}) => {
    return ({
        actionIds,
        onTrackAsyncAction: setActionId,
        onUntrackAsyncAction: unsetActionId,
    });
}
