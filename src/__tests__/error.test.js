import {FluxStandardActionError} from '../error';

describe('FluxStandardActionError', () => {
    it('should throw error if the action is not FSA', () => {
        expect(new FluxStandardActionError()).toBeInstanceOf(FluxStandardActionError);
    });

    it('should generate stack even if Error.captureStackTracethrow is not a function', () => {
        Error.captureStackTrace = 'string';
        expect(new FluxStandardActionError()).toBeInstanceOf(FluxStandardActionError);
    });
});
