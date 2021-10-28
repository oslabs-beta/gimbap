import React, { useState, useCallback, useEffect } from 'react';

import { ThemeProvider } from '@mui/material/styles';
import Stack from '@mui/material/Stack';

import { Cluster, Route } from './../../src/shared/types';
import { Page, SubPage } from './types';
import { fetchRoutes, fetchClusters } from './utils/ajax';
import { darkTheme, lightTheme } from './theme';
import NavigationBar from './components/common/NavigationBar';
import Clusters from './components/clusters/Clusters';
import Metrics from './components/metrics/Metrics';
import Documentation from './components/documentation/Documentation';


export default function App() {
  const [useLightTheme, setUseLightTheme] = useState(true);

  const [isNavBarOpen, setIsNavBarOpen] = React.useState<boolean>(true);
  const [page, setPage] = useState<Page>(Page.Clusters);
  const [metricSubPage, setMetricSubPage] = useState<SubPage>(SubPage.ClusterLoad);
  const [docSubPage, setDocSubPage] = useState<SubPage>(SubPage.None);

  const [clusters, setClusters] = useState<Cluster[] | null>(null);
  const [routes, setRoutes] = useState<Route[] | null>(null);

  const showApiDocPage: () => void = useCallback(() => setDocSubPage(SubPage.ApiDoc), [setDocSubPage]);


  // pre-load routes and clusters
  useEffect(() => {
    fetchRoutes((routes) => {
      routes = routes as Route[];
      routes.sort((r1: Route, r2: Route) => r1.method + r1.endpoint > r2.method + r2.endpoint ? 1 : -1);
      setRoutes(routes);
    });

    fetchClusters(setClusters);
  }, []);

  return (
    <div
      style={{
        backgroundImage: useLightTheme
          ? 'url(\'https://coolbackgrounds.io/images/backgrounds/white/pure-white-background-85a2a7fd.jpg\')'
          : 'url(\'https://cdn.wallpapersafari.com/99/51/SXfiUY.jpg\')'
      }}>
      <ThemeProvider theme={useLightTheme ? lightTheme : darkTheme}>
        <Stack id='app' direction='row'>
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
          {page === Page.Clusters && <Clusters useLightTheme={useLightTheme} clusters={clusters} />}
          {page === Page.Metrics &&
            <Metrics
              routes={routes}
              clusters={clusters}
              useLightTheme={useLightTheme}
              metricSubPage={metricSubPage}
              isNavBarOpen={isNavBarOpen}
            />
          }
          {page === Page.Documentation &&
            <Documentation subPage={docSubPage} useLightTheme={useLightTheme} showApiDocPage={showApiDocPage} />
          }
        </Stack>
      </ThemeProvider>
    </div>
  );
}
