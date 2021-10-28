import React, { useEffect, useState } from 'react';

import { Cluster } from './../../../shared/types';
import TreeGraph from './treegraph/TreeGraph';
import Splash from './../common/Splash';

export default function Clusters({
  useLightTheme,
  clusters,
}: {
  useLightTheme: boolean;
  clusters: Cluster[] | null;
}) {

  const [dimensions, setDimensions] = useState({
    height: document.documentElement.clientHeight,
    width: document.documentElement.clientWidth,
  });

  //Resize the window and update the state
  useEffect(() => {
    function handleResize() {
      setDimensions({
        height: document.documentElement.clientHeight,

        width: document.documentElement.clientWidth
      });
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  return (<>
    {clusters === null && <Splash />}
    {clusters !== null && <TreeGraph width={dimensions.width * 0.60} height={(dimensions.height * 0.90)} useLightTheme={useLightTheme} />}
  </>);
}
