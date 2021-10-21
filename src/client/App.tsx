import React, { useState } from 'react';

import { darkTheme, lightTheme } from './theme';
import { ThemeProvider } from '@mui/material/styles';
import Stack from '@mui/material/Stack';

import { Page } from './types';

import NavigationBar from './components/common/NavigationBar';
import Clusters from './components/clusters/Clusters';
import Metrics from './components/metrics/Metrics';
import Documentation from './components/documentation/Documentation';

export default function App() {
  const [useLightTheme, setUseLightTheme] = useState(true); // TODO hook up theme toggle
  const [page, setPage] = useState<Page>(Page.Clusters);

  return (
    <ThemeProvider theme={useLightTheme ? lightTheme : darkTheme}>
      <Stack id="app" direction='row'>
        <NavigationBar page={page} setPage={setPage} />
        {page === Page.Clusters && <Clusters />}
        {page === Page.Metrics && <Metrics />}
        {page === Page.Documentation && <Documentation />}
      </Stack>
    </ThemeProvider>
  );
}
