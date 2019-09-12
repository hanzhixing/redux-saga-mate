import {hot} from 'react-hot-loader/root';
import ClickLoadingSuccess from '../../connects/SimpleButtons/ClickLoadingSuccess';
import ClickLoadingError from '../../connects/SimpleButtons/ClickLoadingError';
import ClickLoading1 from '../../connects/SimpleButtons/ClickLoading1';
import ClickLoading2 from '../../connects/SimpleButtons/ClickLoading2';
import ClickLoading3 from '../../connects/SimpleButtons/ClickLoading3';

export default hot(()=> (
    <>
        <div className="row m-3">
            <ClickLoadingSuccess />
        </div>
        <div className="row m-3">
            <ClickLoadingError />
        </div>
        <div className="row m-3">
            [1] and [2] below dispatch same action. (types and payloads are the same)
        </div>
        <div className="row m-3">
            So they will share the same loading state.
        </div>
        <div className="row m-3">
            But [3] will not share the same loading state, even if its type and payload are the same too.
        </div>
        <div className="row m-3">
            Because we make the action unique:
            <b>Action Type + Action Payload + Action Time = Action Instance.</b>
        </div>
        <div className="row m-3">
            <ClickLoading1 />
        </div>
        <div className="row m-3">
            <ClickLoading2 />
        </div>
        <div className="row m-3">
            <ClickLoading3 />
        </div>
    </>
));
