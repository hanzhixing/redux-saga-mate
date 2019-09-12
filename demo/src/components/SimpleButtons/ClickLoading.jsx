import cx from './index.m.scss';

export default ({id, loading, onClick}) => (
    <button
        type="button"
        onClick={onClick}
        disabled={loading === true}
        className={cx('btn', 'btn-primary')}
    >
        {`[ ${id} ] `}
        {loading && (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
        )}
        {loading ? ' Loading...' : 'Click to Loading'}
    </button>
);
