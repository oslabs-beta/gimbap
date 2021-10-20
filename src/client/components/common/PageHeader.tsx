import React from 'react';

import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import MenuIcon from '@mui/icons-material/Menu';
import Slide from '@mui/material/Slide';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import {drawerWidth} from './NavigationBar';

const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

function HideOnScroll({children}: {children: JSX.Element}): JSX.Element {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export default function pageHeader({
  open,
  header,
  handleDrawerOpen,
}: {open: boolean, header: string, handleDrawerOpen: () => void}) {
  return (
    <HideOnScroll>
      <AppBar position='fixed' open={open}>
        <Toolbar>
          <IconButton
            color='inherit'
            aria-label='open drawer'
            onClick={handleDrawerOpen}
            edge='start'
            sx={{
              marginRight: '36px',
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant='h6' noWrap component='div'>
            {header}
          </Typography>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
}
