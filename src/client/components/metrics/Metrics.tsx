import React from 'react';

import { Route, Cluster } from './../../../shared/types';
import { SubPage } from './../../types';

import RouteLoad from './RouteLoad';
import ClusterLoad from './ClusterLoad';

export default function Metrics({
  routes,
  clusters,
  useLightTheme,
  isNavBarOpen,
  metricSubPage,
}: {
  routes: Route[] | null;
  clusters: Cluster[] | null;
  useLightTheme: boolean;
  isNavBarOpen: boolean;
  metricSubPage: SubPage;
}) {
  return (<>
    {metricSubPage === SubPage.RouteLoads &&
      <RouteLoad useLightTheme={useLightTheme} isNavBarOpen={isNavBarOpen} routes={routes} />
    }
    {metricSubPage === SubPage.ClusterLoad &&
      <ClusterLoad useLightTheme={useLightTheme} isNavBarOpen={isNavBarOpen} clusters={clusters} />
    }
  </>);
}
