import ReactModal from 'react-modal';
import {e2e} from '../../utils';
import cx from './index.m.scss';

ReactModal.setAppElement(document.body);

export default ({isLoading, fullName, onCloseAuthorModal}) => (
    <ReactModal
        isOpen={true}
        contentLabel="Author Infomation"
        style={{
            content: {
                width: '400px',
                height: '100px',
                fontSize: '24px',
                textAlign: 'center',
                margin: '30px auto',
                paddingTop: '30px',
            }
        }}
    >
        {
            isLoading && (
                <div className="spinner-border spinner-border-sm" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            )
        }
        {fullName}
        {' '}
        <button
            type="button"
            onClick={onCloseAuthorModal}
            className={cx('btn btn-primary btn-sm', e2e('global-author-modal'))}
        >
            Close
        </button>
    </ReactModal>
);
