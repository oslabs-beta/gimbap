import React from 'react';
import Enzyme, { shallow, mount, render, ReactWrapper, hasClass } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import renderer from 'react-test-renderer';
import toJson from 'enzyme-to-json';
//import { createShallow } from '@material-ui/core/test-utils';
//import {MuiDrawer as Drawer} from '@mui/material/Drawer';


// Enzyme is a wrapper around React test utilities which makes it easier too
// shallow render and traverse the shallow rendered tree.
import {} from '../../../../../src/client/App';
import  NavigationBar  from '../../../../../src/client/components/common/NavigationBar';
import Box from '@mui/material/Box';
//import Drawer from '../../../../../src/client/components/common/NavigationBar';
import Drawer from '@mui/material/Drawer';
import NavItem from '../../../../../src/client/components/common/NavItem';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import sinon from 'sinon';
// Need to import navItem from NavigationBar




// Configure Enzyme to use the adapter;
Enzyme.configure({ adapter: new Adapter() });

/**
 * What to test?
 * -. App div component contains the child themeprovider, and the themeprovider child Stack
 * -. NavigationBar has <Box> component.
 * -. NavigationBar has child Cluster, Metrics, and documentation

 */

describe('React unit tests', () => {
  describe('Navigation bar', () => {
    let wrapper;
    const props = {
      page: 0,
      setPage: ()=>console.log('test0'),
      open: true,
      useLightTheme: true,
      setMetricSubPage: ()=>console.log('test0'),
      setOpen: ()=>console.log('test'),
      setUseLightTheme: ()=>console.log('test2'),
      setDocSubPage: () => console.log('test3'),
      showApiDocPage: () => console.log('test4')
    };

    beforeAll(() => {
      wrapper = mount(<NavigationBar {...props}/>);
    });

    it('Renders one <Box> component from NavigationBar', () => {
      // const wrapper = Enzyme.shallow<NavigationBar>(<NavigationBar />);
      // expect(wrapper.find(Drawer)).toHaveLength(1);
      expect(wrapper.find(Box)).toHaveLength(1);
      // expect(wrapper.find(Drawer).to.have.lengthOf(1));
    });

    it('Renders one Drawer, Divider, Stack, and 3 NavItem components from <NavigationBar>', () => {

      expect(wrapper.find(Drawer));
      expect(wrapper.find(Divider));
      expect(wrapper.find(Stack));
      expect(wrapper.find(NavItem)).toHaveLength(3);
    });

    it('Checks if nav items are correct', () => {
      // const onButtonClick = sinon.spy();

      expect(wrapper.find(NavItem).at(0).toEqual('Clusters'));
      expect(wrapper.find(NavItem).at(1).toEqual('Metrics'));
      expect(wrapper.find(NavItem).at(2).toEqual('Documentation'));
    });
  });
});
