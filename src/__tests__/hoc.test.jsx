import '@testing-library/jest-dom'
import React from 'react';
import {fireEvent, render} from '@testing-library/react';
import {withAsyncActionStateHandler, createAsyncActionContext} from '../hoc';

describe('withAsyncActionStateHandler', () => {
    const Base = ({actionIds, setActionId, unsetActionId}) => (
        <>
            <div>
                <span id="text-string-type">{typeof actionIds.string}</span>
                <span id="text-string-value">{actionIds.string}</span>
                <button type="button" id="button-set-string" onClick={() => setActionId('string', 'abc')} />
                <button type="button" id="button-unset-string" onClick={() => unsetActionId('string')} />
            </div>
            <div>
                <span id="text-parent-type">{typeof actionIds.parent}</span>
                <span id="text-parent-value">{JSON.stringify(actionIds.parent)}</span>
                <span id="text-child-type">{typeof actionIds.parent?.child}</span>
                <span id="text-child-value">{actionIds.parent?.child}</span>
                <button type="button" id="button-set-nested" onClick={() => setActionId(['parent', 'child'], 'xyz')} />
                <button type="button" id="button-unset-nested" onClick={() => unsetActionId(['parent', 'child'])} />
            </div>
        </>
    );

    const Enhanced = withAsyncActionStateHandler()(Base);

    it('should update actionIs by setActionId, and delete actionIds by unsetActionId.', () => {
        render(<Enhanced />);

        fireEvent.click(document.getElementById('button-set-string'));

        expect(document.getElementById('text-string-type')).toHaveTextContent('string');
        expect(document.getElementById('text-string-value')).toHaveTextContent('abc');

        fireEvent.click(document.getElementById('button-unset-string'));

        expect(document.getElementById('text-string-type')).toHaveTextContent('undefined');
        expect(document.getElementById('text-string-value')).toHaveTextContent('');
    });

    it('should update actionIs by setActionId, and delete actionIds by unsetActionId.(nested)', () => {
        render(<Enhanced />);

        fireEvent.click(document.getElementById('button-set-nested'));

        expect(document.getElementById('text-parent-type')).toHaveTextContent('object');
        expect(document.getElementById('text-parent-value')).toHaveTextContent('{"child":"xyz"}');
        expect(document.getElementById('text-child-type')).toHaveTextContent('string');
        expect(document.getElementById('text-child-value')).toHaveTextContent('xyz');

        fireEvent.click(document.getElementById('button-unset-nested'));

        expect(document.getElementById('text-parent-type')).toHaveTextContent('object');
        expect(document.getElementById('text-parent-value')).toHaveTextContent('{}');
        expect(document.getElementById('text-child-type')).toHaveTextContent('undefined');
        expect(document.getElementById('text-child-value')).toHaveTextContent('');
    });
});

describe('createAsyncActionContext', () => {
    const {withAsyncActionContextProvider, withAsyncActionContextConsumer} = createAsyncActionContext();

    const Child = props => (
        <div>
            <span id="actionIds">{'actionIds' in props ? 'Y' : 'N'}</span>
            <span id="setActionId">{'setActionId' in props ? 'Y' : 'N'}</span>
            <span id="unsetActionId">{'unsetActionId' in props ? 'Y' : 'N'}</span>
        </div>
    );

    const EnhancedChild = withAsyncActionContextConsumer(Child);

    const Parent = () => (<EnhancedChild bar="bar" />);

    const EnhancedParent = withAsyncActionContextProvider(Parent);

    it('should pass actionIds, setActionId, unsetActionId as props additionally by internal consumer', () => {
        render(<EnhancedParent foo="foo" />);

        expect(document.getElementById('actionIds')).toHaveTextContent('Y');
        expect(document.getElementById('setActionId')).toHaveTextContent('Y');
        expect(document.getElementById('unsetActionId')).toHaveTextContent('Y');
    });
});
