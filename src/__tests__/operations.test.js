import {UPDATE, DELETE} from '../operation';

describe('UPDATE, DELETE', () => {
    it('should be equal to specific strings', () => {

        expect(UPDATE).toEqual('UPDATE');
        expect(DELETE).toEqual('DELETE');
    });
});
