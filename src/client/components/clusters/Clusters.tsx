import React, { useState, useCallback } from 'react';
import TreeGraph from './treegraph/TreeGraph';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { createTheme, Theme } from '@mui/material/styles';


export default function Clusters() {
  const [useLightTheme, setUseLightTheme] = useState(true); // TODO hook up theme toggle

  return(
    //<ParentSize>{({ width, height }) => <TreeGraph width={width} height={height} />}</ParentSize>
    <TreeGraph width={window.innerWidth /2} height={window.innerHeight} useLightTheme={useLightTheme} />

    // routes scroll
  );

}
