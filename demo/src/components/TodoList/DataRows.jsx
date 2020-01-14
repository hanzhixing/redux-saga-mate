import {get} from 'lodash/fp';
import DataRow from './DataRow';

const DataRows = ({
    items,
    selected,
    onStar,
    onStarTransient,
    onClearStarLoading,
    onViewAuthor,
    onToggleCheck,
}) => items.map(item => (
    <DataRow
        key={item.id}
        {...item}
        isChecked={(selected || []).includes(item.id)}
        onStar={onStar}
        onStarTransient={get(item.id, onStarTransient)}
        onViewAuthor={onViewAuthor}
        onToggleCheck={onToggleCheck}
        onClearStarLoading={onClearStarLoading}
    />
));

export default DataRows;
