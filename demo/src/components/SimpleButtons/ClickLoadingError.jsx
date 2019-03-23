import cx from './index.m.scss';

export default ({loading, error, onClick, onReset}) => (
    <button
        type="button"
        onClick={error ? onReset : onClick}
        disabled={loading === true}
        className={cx(
            'btn',
            {
                'btn-primary': loading !== false,
                'btn-danger': error,
            }
        )}
    >
        {
            loading === true && (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            )
        }
        {loading === undefined && !error && 'Click to be Loading, then to be Error'}
        {loading === true && ' Loading...'}
        {error && 'Error! Click again to reset'}
    </button>
);
