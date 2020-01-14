import {repeat} from '../../utils';

const Loading = () => {
    const rows = [];

    const loading = n => (
        <tr key={n}>
            <td colSpan="4" className="text-center">
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

    repeat(5)(makeLoading)(1);

    return rows;
};

export default Loading;
