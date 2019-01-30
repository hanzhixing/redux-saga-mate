import React from 'react';
import ReactModal from 'react-modal';

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
        {fullName}{' '}
        <button onClick={onCloseAuthorModal}>Close</button>
    </ReactModal>
);
