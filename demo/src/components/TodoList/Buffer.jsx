import {e2e} from '../../utils';
import cx from './index.m.scss';

export default ({buffer, onAccept}) => (
    <tr key="buffer">
        <td colSpan="4" className="text-center">
            {`${buffer.length} new records, click to`}
            {' '}
            <button
                type="button"
                onClick={onAccept}
                className={cx('btn btn-outline-primary btn-sm', e2e('accept-new-buffer'))}
            >
                accpet!
            </button>
        </td>
    </tr>
);
