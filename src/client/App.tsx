import React, { useState } from 'react';

import { darkTheme, lightTheme } from './theme';
import { ThemeProvider } from '@mui/material/styles';
import Stack from '@mui/material/Stack';

import { Page } from './types';

import NavigationBar from './components/common/NavigationBar';
import Clusters from './components/clusters/Clusters';
import Metrics from './components/metrics/Metrics';
import Documentation from './components/documentation/Documentation';
import TreeGraph from './components/clusters/treegraph/TreeGraph';
import ParentSize from '@visx/responsive/lib/components/ParentSize';

export default function App() {
  const [useLightTheme, setUseLightTheme] = useState(true); // TODO hook up theme toggle
  const [page, setPage] = useState<Page>(Page.Clusters);

  return(
    <div id="app" >
      {/* <NavigationBar pageHeader={pageHeader} setPage={setPage} setPageHeader={setPageHeader} />
      {page === Page.Clusters && <Clusters />}
      {page === Page.Metrics && <Metrics />}
      {page === Page.Documentation && <Documentation />} */}
      <ParentSize>{({ width, height }) => <TreeGraph width={ window.innerWidth} height={ window.innerHeight - 400} />}</ParentSize>,
    </div>
  );
}
