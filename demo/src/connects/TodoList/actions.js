import {createAsyncActionContext} from 'redux-saga-mate';

export const {
    withAsyncActionContextProvider,
    withAsyncActionContextConsumer,
} = createAsyncActionContext();

export const mapAsyncActionProps = ({actionIds, setActionId, unsetActionId}) => ({
    actionIds,
    onTrackAsyncAction: setActionId,
    onUntrackAsyncAction: unsetActionId,
});
