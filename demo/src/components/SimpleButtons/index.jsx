import {hot} from 'react-hot-loader/root';
import ClickLoadingSuccess from '../../connects/SimpleButtons/ClickLoadingSuccess';
import ClickLoadingError from '../../connects/SimpleButtons/ClickLoadingError';

export default hot(()=> (
    <>
        <div className="row m-3">
            <ClickLoadingSuccess />
        </div>
        <div className="row m-3">
            <ClickLoadingError />
        </div>
    </>
));
