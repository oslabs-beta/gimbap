import React, { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Splash from './../common/Splash';
import LoadGraph from './LoadGraph';

import { Route, LoadData } from './../../../shared/types';
import { fetchRoutes, fetchRouteLoadData } from './../../utils/ajax';
import { drawerWidth } from './../common/NavigationBar';
import useWindowDimensions from './../../hooks/useWindowDimensions';
import ChipSelector from './../common/ChipSelector';

export default function RouteLoad({
  isNavBarOpen,
  useLightTheme,
}: {
  isNavBarOpen: boolean;
  useLightTheme: boolean
}): JSX.Element {

  const { width: windowWidth } = useWindowDimensions();

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
        fetchRouteLoadData(routes[index], index, setRoutesLoadData);
      }
    }
  }, [routes, routesLoadData, selectedRoutes]);

  // TODO when user has graph selected, but data is not available, show splash

  const selectedLoadData: { [key: number]: LoadData | undefined } = selectedRoutes.map((index: number) => routesLoadData[index]);

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
          label='Routes'
        />

        {Object.entries(selectedLoadData).map(([index, loadData]) => {
          if (!loadData) return <Splash />;

          const i: number = parseInt(index);
          const label = routeLabels[i];

          return (<LoadGraph
            key={index}
            useLightTheme={useLightTheme}
            height={400}
            width={windowWidth - (isNavBarOpen ? drawerWidth : 0) - 100}
            loadData={loadData}
            label={label}
          />);
        })}
      </Stack>
    }
  </>);
}
