import React, { useState, useCallback } from 'react';

import { ThemeProvider } from '@mui/material/styles';
import Stack from '@mui/material/Stack';

import { Page, SubPage } from './types';
import { darkTheme, lightTheme } from './theme';
import NavigationBar from './components/common/NavigationBar';
import Clusters from './components/clusters/Clusters';
import Metrics from './components/metrics/Metrics';
import Documentation from './components/documentation/Documentation';

export default function App() {
  const [useLightTheme, setUseLightTheme] = useState(true); // TODO hook up theme toggle
  const [isNavBarOpen, setIsNavBarOpen] = React.useState<boolean>(true);
  const [page, setPage] = useState<Page>(Page.Clusters);
  const [metricSubPage, setMetricSubPage] = useState<SubPage>(SubPage.ClusterLoad);
  const [docSubPage, setDocSubPage] = useState<SubPage>(SubPage.None);

  const showApiDocPage: () => void = useCallback(() => setDocSubPage(SubPage.ApiDoc), [setDocSubPage]);

  return (
    <ThemeProvider theme={useLightTheme ? lightTheme : darkTheme}>
      <Stack id="app" direction='row'>
        <NavigationBar
          page={page} setPage={setPage}
          open={isNavBarOpen}
          useLightTheme={useLightTheme}
          setMetricSubPage={setMetricSubPage}
          setOpen={setIsNavBarOpen}
          setUseLightTheme={setUseLightTheme}
          setDocSubPage={setDocSubPage}
          showApiDocPage={showApiDocPage}
        />
        {page === Page.Clusters && <Clusters
        isNavBarOpen={isNavBarOpen}
        />
        }
        {page === Page.Metrics &&
          <Metrics
            useLightTheme={useLightTheme}
            metricSubPage={metricSubPage}
            isNavBarOpen={isNavBarOpen}
          />
        }
        {page === Page.Documentation && <Documentation subPage={docSubPage} useLightTheme={useLightTheme} showApiDocPage={showApiDocPage} />}
      </Stack>
    </ThemeProvider>
  );
}
