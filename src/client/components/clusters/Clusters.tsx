import React from 'react';

import { Cluster } from './../../../shared/types';
import { drawerWidth, closedDrawerWidth } from './../common/NavigationBar';
import getWindowDimensions from './../../hooks/useWindowDimensions';
import TreeGraph from './TreeGraph';
import Splash from './../common/Splash';


export default function Clusters({
  isNavBarOpen,
  clusters,
}: {
  isNavBarOpen: boolean;
  clusters: Cluster[] | null;
}) {

  const { width, height } = getWindowDimensions();

  // TODO adjust as needed I removed percent cuts
  return (<>
    {clusters === null && <Splash />}
    {clusters !== null && <TreeGraph width={(isNavBarOpen ? width - drawerWidth : width - closedDrawerWidth)} height={height - 2} />}
  </>);
}
