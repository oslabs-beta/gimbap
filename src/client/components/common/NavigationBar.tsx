import React, { useCallback } from 'react';

import { styled, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import LightModeIcon from '@mui/icons-material/LightMode';
import NightlightIcon from '@mui/icons-material/Nightlight';
import useWindowDimensions from './../../hooks/useWindowDimensions';

import { Page, SubPage } from './../../types';
import NavItem from './NavItem';

import './NavigationBar.scss';

export const drawerWidth = 240;
export const closedDrawerWidth = 73;

const openedMixin = (theme: Theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any, // remove typescript complaint together with above line TODO determine how to fix this
);

export default function NavigationBar({
  useLightTheme,
  page,
  open,
  setOpen,
  setMetricSubPage,
  setDocSubPage,
  setPage,
  showApiDocPage,
  setUseLightTheme,
}: {
  page: Page;
  open: boolean;
  useLightTheme: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMetricSubPage: React.Dispatch<React.SetStateAction<SubPage>>;
  setDocSubPage: React.Dispatch<React.SetStateAction<SubPage>>;
  setPage: React.Dispatch<React.SetStateAction<Page>>;
  showApiDocPage: () => void;
  setUseLightTheme: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {

  const handleThemeChange: (event: React.ChangeEvent<HTMLInputElement>) => void = useCallback((event) => {
    setUseLightTheme(event.target.checked);
  }, [setUseLightTheme]);

  const handleDrawerOpen: () => void = useCallback(() => setOpen(true), [setOpen]);
  const handleDrawerClose: () => void = useCallback(() => setOpen(false), [setOpen]);

  const showClustersPage: () => void = useCallback(() => setPage(Page.Clusters), [setPage]);

  const showMetricsPage: () => void = useCallback(() => setPage(Page.Metrics), [setPage]);
  const showClusterLoadPage: () => void = useCallback(() => setMetricSubPage(SubPage.ClusterLoad), [setMetricSubPage]);
  const showRouteLoadPage: () => void = useCallback(() => setMetricSubPage(SubPage.RouteLoads), [setMetricSubPage]);

  const showDocumentationPage: (event: React.MouseEvent<HTMLElement>) => void = useCallback((event: React.SyntheticEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).innerHTML === 'Documentation') setDocSubPage(SubPage.None);
    setPage(Page.Documentation);
  }, [setPage, setDocSubPage]);

  const { height } = useWindowDimensions();

  return (
    <Box sx={{ display: 'flex', boxShadow: 10, }} style={{minHeight: height,}}>
      <Drawer variant='permanent' open={open} sx={{boxShadow: 10, }}>
        <DrawerHeader>
          {open && <>
            <Typography variant='h4' sx={{ fontWeight: 'medium', textShadow: useLightTheme ? '0 1px 0 #e2e3dc' : '0 1px 0 #5c5758' }} color='#28A78D' mr={3}>gimbap</Typography>
            <IconButton onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </>}
          {!open &&
            <IconButton
              color='inherit'
              aria-label='open drawer'
              onClick={handleDrawerOpen}
              edge='start'
              sx={{
                marginRight: '10px',
              }}
            >
              <MenuIcon />
              {/* <Logo /> */}
            </IconButton>
          }
        </DrawerHeader>

        <Divider />

        <Stack direction='row' id='theme-select'>
          <NightlightIcon />
          <Switch
            size='small'
            checked={useLightTheme}
            onChange={handleThemeChange}
            inputProps={{ 'aria-label': 'light theme' }}
          />
          <LightModeIcon />
        </Stack>

        <NavItem
          title='Clusters'
          isActive={page === Page.Clusters && open}
          icon={BubbleChartIcon}
          subLinks={[]}
          onClick={showClustersPage}
        />
        <NavItem
          title='Metrics'
          isActive={page === Page.Metrics && open}
          icon={AssessmentIcon}
          subLinks={[
            {
              title: 'Cluster Loads',
              onClick: showClusterLoadPage,
            },
            {
              title: 'Route Loads',
              onClick: showRouteLoadPage,
            }
          ]}
          onClick={showMetricsPage}
        />
        <NavItem
          title='Documentation'
          isActive={page === Page.Documentation && open}
          icon={DescriptionIcon}
          subLinks={[
            // TODO optimize with useCallback
            {
              title: 'Intro',
              onClick: () => {
                setDocSubPage(SubPage.None);
                window.location.href = '#intro';
              },
            },
            {
              title: 'Installation',
              onClick: () => {
                setDocSubPage(SubPage.None);
                window.location.href = '#installation';
              },
            },
            {
              title: 'Visualizing Your Data',
              onClick: () => {
                setDocSubPage(SubPage.None);
                window.location.href = '#visualizing-your-data';
              },
            },
            {
              title: 'API',
              onClick: showApiDocPage,
            },
            {
              title: 'Contributors',
              onClick: () => {
                setDocSubPage(SubPage.None);
                window.location.href = '#contributors';
              },
            },
          ]}
          onClick={showDocumentationPage}
        />
      </Drawer>
    </Box>
  );
}
