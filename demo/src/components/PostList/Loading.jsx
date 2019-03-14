import {repeat} from '../../utils';

export default () => {
    const rows = [];

    const loading = n => (
        <tr key={n}>
            <td colSpan="5" className="text-center">
                <div className="text-center">
                    <div className="spinner-border spinner-border-sm" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            </td>
        </tr>
    );

    const makeLoading = n => {
        rows.push(loading(n));
        return n + 1;
    };

    repeat(10)(makeLoading)(1);

    return rows;
}
