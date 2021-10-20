import React from 'react';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import AppsIcon from '@mui/icons-material/Apps';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import DescriptionIcon from '@mui/icons-material/Description';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';

const navBar = {
  'data' : [
    { 'name': 'Clusters',
      'url': '/api/clusters'},
    { 'name': 'Metrics',
      'children': [
        {'name': 'Clusters Time-Series',
          'url': '/api/metrics/clustersTimeSeries'},
          {'name': 'Routes Time-Series',
          'url': '/api/metrics/routesTimeSeries'}
      ]},
    { 'name': 'Documentation',
      'children': [
        {'name': 'Intro',
          'url': '/api/docs/intro'},
        {'name': 'Installation',
          'url': '/api/docs/install'},
        {'name': 'Getting Started',
          'url': '/api/docs/gettingStarted'},
        {'name': 'Testing your App',
          'url': '/api/docs/testing'},
        {'name': 'FAQs',
          'url': '/api/docs/faqs'},
        {'name': 'Credits',
          'url': '/api/docs/credits'}
      ]}
  ]
};

const drawerWidth = 240;


export default function NavigationBar(): JSX.Element {

  return (
    <Box sx={{ display: 'flex' }}>
    <CssBaseline />
    <AppBar
      position="fixed"
      sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Permanent drawer
        </Typography>
      </Toolbar>
    </AppBar>
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
    <h1 className="logo"> gimbap </h1>
      <Toolbar />
      <Divider />
      <List component="nav">
        <ListItem button className="menu_button">
          <ListItemIcon>
            <AppsIcon />
          </ListItemIcon>
          <ListItemText primary="Clusters" />
        </ListItem>
        <ListItem button className="menu_button">
          <ListItemIcon>
            <InsertChartIcon />
          </ListItemIcon>
          <ListItemText primary="Metrics" />
        </ListItem>
          {['Clusters Time Series',
          'Routes Time Series',]
          .map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>
                <SubdirectoryArrowRightIcon />
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
        ))}
      </List>
      <Divider />
      <List component="nav">
        <ListItem button className="menu_button">
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          <ListItemText primary="Documentation" />
        </ListItem>
          {['Introduction',
          'Installation',
          'Getting Started',
          'Testing your App',
          'FAQs',
          'Credits']
          .map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>
                <SubdirectoryArrowRightIcon />
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
        ))}
      </List>
    </Drawer>
    <Box
      component="main"
      sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
    >
      <Toolbar />
      <Typography paragraph>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod

      </Typography>
      <Typography paragraph>
        Consequat mauris nunc congue nisi vitae suscipit. Fringilla est ullamcorper

      </Typography>
    </Box>
  </Box>
  );
}
