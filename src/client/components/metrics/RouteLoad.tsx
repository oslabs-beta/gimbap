import React, { useState, useEffect, useCallback } from 'react';

import { Route, LoadData } from './../../../shared/types';
import { fetchWrapper } from './../../utils/ajax';
import Splash from './../common/Splash';
import LoadGraph from './LoadGraph';

import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useTheme, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

/**
 * Used to style chip menu item.
 * 
 * @param index - Index of current item in routes
 * @param selected - List of indices of selected items in routes
 * @param theme - MUI theme
 * 
 * @returns Typography theme settings
 * 
 * @private
 */
function getStyles(index: number, selected: number[], theme: Theme) {
  return {
    fontWeight: selected.indexOf(index) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
  };
}

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

export default function RouteLoad() {

  const theme = useTheme();

  const [routes, setRoutes] = useState<Route[] | null>(null);
  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([]); // indices in routes
  const [routesLoadData, setRoutesLoadData] = useState<{ [key: number]: LoadData }>(Object.create(null));

  const handleChange = useCallback((event: SelectChangeEvent<number[]>) => {
    const { target: { value } } = event;
    setSelectedRoutes(
      // On autofill we get a stringified value
      typeof value === 'string' ? value.split(',').map(val => parseInt(val)) : value,
    );
  }, []);

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

  const selectedLoadData: { [key: number]: LoadData } = Object.entries(routesLoadData).reduce((selected, [index, loadData]) => {
    if (selectedRoutes.includes(parseInt(index))) selected[index] = loadData;
    return selected;
  }, Object.create(null));

  return (<>
    {!routes && <Splash />}
    {routes &&
      <Stack sx={{ padding: 2 }}>
        <Typography variant='h4'>Route Load Graphs</Typography>
        <Typography variant='body1'>Average number of server calls to a particular endpoint per 24-hour time period.</Typography>
        <Typography variant='body1' mt={4}>Select routes to view graphs.</Typography>

        <FormControl sx={{ m: 1, maxWidth: 500 }}>
          <InputLabel id="multiple-routes-label">Routes</InputLabel>
          <Select
            labelId="multiple-routes-label"
            id="multiple-routes"
            multiple
            value={selectedRoutes}
            onChange={handleChange}
            input={<OutlinedInput id="select-multiple-route" label="Route" />}
            renderValue={(selectedRoutes: number[]) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selectedRoutes.map((index: number) => {
                  const label = `${routes[index].method} ${routes[index].endpoint}`;
                  return (
                    <Chip
                      key={label}
                      label={label}
                    />
                  );
                })}
              </Box>
            )}
            MenuProps={
              {
                PaperProps: {
                  style: {
                    maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                    width: 250,
                  },
                },
              }
            }
          >
            {routes.map((route: Route, i: number) => {
              const label = `${route.method} ${route.endpoint}`;
              return (
                <MenuItem
                  key={label}
                  value={i}
                  style={getStyles(i, selectedRoutes, theme)}
                >
                  {label}
                </MenuItem>
              );
            })
            }
          </Select>
        </FormControl>

        {Object.entries(selectedLoadData).map(([index, loadData]) =>
          <LoadGraph key={index} loadData={loadData} />
        )}
      </Stack>
    }
  </>);
}
