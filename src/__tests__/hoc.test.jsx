import {shallow, mount, render} from 'enzyme';
import {withAsyncActionStateHandler, createAsyncActionContext} from '../hoc';

describe('withAsyncActionStateHandler', () => {
    const Base = props => null;

    const Enhanced = withAsyncActionStateHandler()(Base);

    const wrapper = mount(<Enhanced foo="bar" />);

    const base = wrapper.find(Base);

    const desired = {
        actionIds: {},
        setActionId: expect.any(Function),
        unsetActionId: expect.any(Function),
        foo: 'bar',
    };

    it('should pass actionIds, setActionId, unsetActionId as props additionally', () => {
        expect(base.props()).toMatchObject(desired);
    });

    wrapper.unmount();
});

// TODO Do not no how to test react new context api
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

    const wrapper = mount(
        <EnhancedParent>
            <EnhancedChild foo="bar" />
        </EnhancedParent>
    );
});
