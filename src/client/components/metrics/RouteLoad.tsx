import React, { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Splash from './../common/Splash';
import LoadGraph from './LoadGraph';

import { Route, LoadData } from './../../../shared/types';
import { fetchWrapper } from './../../utils/ajax';
import ChipSelector from './../common/ChipSelector';

/**
 * Make a fetch request to backend to load unique routes.
 * 
 * @param setRoutes - state setter function for Route[]
 * 
 * @private
 */
async function fetchRoutes(setRoutes: React.Dispatch<React.SetStateAction<Route[] | null>>): Promise<void> {
  const routes: Route[] | void = await fetchWrapper<Route[]>('/api/graph/endpoint');
  if (routes) setRoutes(routes);
}

// TODO add comment
async function fetchRouteLoadData(
  url: string,
  index: number,
  setRoutesLoadData: React.Dispatch<React.SetStateAction<{ [key: number]: LoadData }>>
): Promise<void> {
  const loadData: LoadData | void = await fetchWrapper<LoadData>(url);
  if (loadData) setRoutesLoadData(routesLoadData => {
    const nextRoutesLoadData = Object.assign(Object.create(null), routesLoadData);
    nextRoutesLoadData[index] = loadData;
    return nextRoutesLoadData;
  });
}

export default function RouteLoad({
  useLightTheme,
}: {
  useLightTheme: boolean
}): JSX.Element {
  const [routes, setRoutes] = useState<Route[] | null>(null);
  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([]); // indices in routes
  const [routesLoadData, setRoutesLoadData] = useState<{ [key: number]: LoadData }>(Object.create(null));

  // load all routes on component mounting
  useEffect(() => {
    fetchRoutes(setRoutes);
  }, []);

  // load route load data on user selecting an endpoint
  useEffect(() => {
    if (!routes) return;

    for (const index of selectedRoutes) {
      if (!routesLoadData[index]) {
        const route: Route = routes[index];
        fetchRouteLoadData(
          `/api/graph/endpoint/load?method=${encodeURIComponent(route.method)}&route=${encodeURIComponent(route.endpoint)}`,
          index,
          setRoutesLoadData
        );
      }
    }
  }, [routes, routesLoadData, selectedRoutes]);

  // TODO when user has graph selected, but data is not available, show splash

  const selectedLoadData: { [key: number]: LoadData } = Object.entries(routesLoadData).reduce((selected, [index, loadData]) => {
    if (selectedRoutes.includes(parseInt(index))) selected[index] = loadData;
    return selected;
  }, Object.create(null));

  const routeLabels = routes ? routes.map(route => `${route.method} ${route.endpoint}`) : [];

  return (<>
    {!routes && <Splash />}
    {routes &&
      <Stack sx={{ padding: 2 }}>
        <Typography variant='h4'>Route Load Graphs</Typography>
        <Typography variant='body1'>Average number of server calls to a particular endpoint per 24-hour time period.</Typography>
        <Typography variant='body1' mt={4}>Select routes to view graphs.</Typography>

        <ChipSelector
          itemLabels={routeLabels}
          selected={selectedRoutes}
          setSelected={setSelectedRoutes}
        />

        {Object.entries(selectedLoadData).map(([index, loadData]) => {
          const i: number = parseInt(index);
          const label = routeLabels[i];

          return (<LoadGraph
            key={index}
            useLightTheme={useLightTheme}
            height={340}
            width={420}
            loadData={loadData}
            label={label}
          />);
        })}
      </Stack>
    }
  </>);
}
