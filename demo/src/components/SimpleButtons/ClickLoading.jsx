const ClickLoading = ({id, loading, onClick}) => (
    <button
        type="button"
        onClick={onClick}
        disabled={loading === true}
        className="btn btn-primary"
    >
        {`[ ${id} ] `}
        {loading && (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
        )}
        {loading ? ' Loading...' : 'Click to Loading'}
    </button>
);

export default ClickLoading;
