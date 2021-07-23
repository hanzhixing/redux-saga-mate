import {UPDATE, REPLACE, DELETE} from '../operation';

describe('UPDATE, DELETE', () => {
    it('should be equal to specific strings', () => {

        expect(UPDATE).toEqual('UPDATE');
        expect(REPLACE).toEqual('REPLACE');
        expect(DELETE).toEqual('DELETE');
    });
});
