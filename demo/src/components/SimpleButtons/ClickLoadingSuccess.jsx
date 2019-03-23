import cx from './index.m.scss';

export default ({loading, error, clicked, onClick, onReset}) => (
    <button
        type="button"
        onClick={clicked ? onReset : onClick}
        disabled={loading === true}
        className={cx(
            'btn',
            {
                'btn-primary': loading === true || !clicked,
                'btn-success': clicked && loading === undefined,
            }
        )}
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
