import {createAsyncActionContext} from 'redux-saga-mate/src/hoc';

export const {
    withAsyncActionContextProvider,
    withAsyncActionContextConsumer,
} = createAsyncActionContext();

export const mapAsyncActionProps = ({actionIds, setActionId, unsetActionId}) => ({
    actionIds,
    onTrackAsyncAction: setActionId,
    onUntrackAsyncAction: unsetActionId,
});
