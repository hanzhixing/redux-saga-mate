import {PHASE_GHOST, PHASE_STARTED, PHASE_RUNNING,PHASE_FINISH} from '../phase';

describe('PHASE_GHOST, PHASE_STARTED, PHASE_RUNNING,PHASE_FINISH', () => {
    it('should be equal to specific strings', () => {

        expect(PHASE_GHOST).toEqual('ghost');
        expect(PHASE_STARTED).toEqual('started');
        expect(PHASE_RUNNING).toEqual('running');
        expect(PHASE_FINISH).toEqual('finish');
    });
});
