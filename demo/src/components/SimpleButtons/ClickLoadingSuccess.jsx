const ClickLoadingSuccess = ({loading, error, clicked, onClick, onReset}) => (
    <button
        type="button"
        onClick={clicked ? onReset : onClick}
        disabled={loading === true}
        className={[
            'btn',
            (loading === true || !clicked) ? 'btn-primary' : '',
            (clicked && loading === undefined) ? 'btn-success' : '',

        ].join(' ')}
    >
        {
            loading === true && (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            )
        }
        {!clicked && 'Click to be Loading, then to be Success'}
        {loading === true && ' Loading...'}
        {clicked && !error && !loading && 'Success! Click again to reset'}
    </button>
);

export default ClickLoadingSuccess;
