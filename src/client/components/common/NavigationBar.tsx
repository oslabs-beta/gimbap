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


import { Page, SubPage } from './../../types';
import NavItem from './NavItem';

export const drawerWidth = 240;

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
  }),
);

export default function NavigationBar({
  page,
  open,
  setOpen,
  setMetricSubPage,
  setPage,
}: {
  page: Page;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMetricSubPage: React.Dispatch<React.SetStateAction<SubPage>>;
  setPage: React.Dispatch<React.SetStateAction<Page>>;
}): JSX.Element {

  const handleDrawerOpen: () => void = useCallback(() => setOpen(true), [setOpen]);
  const handleDrawerClose: () => void = useCallback(() => setOpen(false), [setOpen]);

  const showClustersPage: () => void = useCallback(() => setPage(Page.Clusters), [setPage]);

  const showMetricsPage: () => void = useCallback(() => setPage(Page.Metrics), [setPage]);
  const showClusterLoadPage: () => void = useCallback(() => setMetricSubPage(SubPage.ClusterLoad), [setMetricSubPage]);
  const showRouteLoadPage: () => void = useCallback(() => setMetricSubPage(SubPage.RouteLoads), [setMetricSubPage]);

  const showDocumentationPage: () => void = useCallback(() => setPage(Page.Documentation), [setPage]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          {open && <>
            <Typography variant='h4' mr={3}>gimbap</Typography>
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
            </IconButton>
          }
        </DrawerHeader>

        <Divider />

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
            {
              title: 'TODO add pages',
              onClick: () => console.log('TODO'),
            }
          ]}
          onClick={showDocumentationPage}
        />
      </Drawer>
    </Box>
  );
}
