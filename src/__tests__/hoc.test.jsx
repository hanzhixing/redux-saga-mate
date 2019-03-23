import {shallow, mount} from 'enzyme';
import {render} from 'react-testing-library';
import {withAsyncActionStateHandler, createAsyncActionContext} from '../hoc';

describe('withAsyncActionStateHandler', () => {
    let doSetActionId;
    let nextActionIds;

    const Base = ({actionIds, setActionId, unsetActionId}) => {
        const handleClickShallow = () => setActionId('onClickShallow', 'abc');
        const handleClickDeep = () => setActionId(['onClickDeep', 'id'], 'xyz');

        const handleClickUnsetShallow = () => unsetActionId('onClickShallow');
        const handleClickUnsetDeep = () => unsetActionId(['onClickDeep', 'id']);

        return (
            <>
                <button type="button" id="shallow" onClick={handleClickShallow} />
                <button type="button" id="unsetshallow" onClick={handleClickUnsetShallow} />
                <button type="button" id="deep" onClick={handleClickDeep} />
                <button type="button" id="unsetdeep" onClick={handleClickUnsetDeep} />
            </>
        );
    };

    const Enhanced = withAsyncActionStateHandler()(Base);

    it('should pass actionIds, setActionId, unsetActionId as props additionally', () => {
        const wrapper = mount(<Enhanced foo="bar" />);

        const desired = {
            actionIds: {},
            setActionId: expect.any(Function),
            unsetActionId: expect.any(Function),
            foo: 'bar',
        };

        expect(wrapper.find(Base).props()).toMatchObject(desired);

        wrapper.unmount();
    });

    it('should update actionIs by setActionId, and delete actionIds by unsetActionId', () => {
        const wrapper = mount(<Enhanced foo="bar" />);

        wrapper.find('#shallow').simulate('click');

        expect(wrapper.find(Base).props().actionIds).toEqual({
            'onClickShallow': 'abc',
        });

        wrapper.find('#deep').simulate('click');

        expect(wrapper.find(Base).props().actionIds).toEqual({
            'onClickShallow': 'abc',
            'onClickDeep': {
                id: 'xyz',
            },
        });

        wrapper.find('#unsetshallow').simulate('click');

        expect(wrapper.find(Base).props().actionIds).toEqual({
            'onClickDeep': {
                id: 'xyz',
            },
        });

        wrapper.find('#unsetdeep').simulate('click');

        expect(wrapper.find(Base).props().actionIds).toEqual({
            'onClickDeep': {},
        });

        wrapper.unmount();
    });

});

// TODO How to test the context?
// @see https://gist.github.com/dndhm/27ce047f4688f9d7968a495c96e31958
describe('createAsyncActionContext', () => {
    const {
        withAsyncActionContextProvider,
        withAsyncActionContextConsumer,
    } = createAsyncActionContext();

    const Parent = () => {
        console.log(111);
        return null;
    }
    const Child = () => {
        console.log(222);
        return <div />;
    }

    const EnhancedParent = withAsyncActionContextProvider(Parent);
    const EnhancedChild = withAsyncActionContextConsumer(Child);

    it('should update actionIs by setActionId, and delete actionIds by unsetActionId', () => {
        const {container, wrapper} = render(
            <EnhancedParent>
                <EnhancedChild foo="bar" />
            </EnhancedParent>
        );

        console.log(container);
    });
});
