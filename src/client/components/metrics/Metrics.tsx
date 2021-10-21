import React from 'react';

import { SubPage } from './../../types';

import RouteLoad from './RouteLoad';
import ClusterLoad from './ClusterLoad';

export default function Metrics({
  metricSubPage,
}: {
  metricSubPage: SubPage;
}) {
  return (<>
    {metricSubPage === SubPage.RouteLoads && <RouteLoad />}
    {metricSubPage === SubPage.ClusterLoad && <ClusterLoad />}
  </>);
}
