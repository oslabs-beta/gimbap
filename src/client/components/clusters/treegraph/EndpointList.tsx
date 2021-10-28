import * as React from 'react';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import Typography from '@mui/material/Typography';


export default function EndpointList(props) {
  const { endpoints } = props;

  function renderRow(props: ListChildComponentProps) {
    const { index, style } = props;
    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton>
          <ListItemText primary={`${endpoints[index]?.name}`} color="#E76f51"/>
        </ListItemButton>
      </ListItem>
    );
  }

  const renderSingleRow = (props: ListChildComponentProps) => {
    const { index, style } = props;

    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton>
        <ListItemText
        disableTypography primary={<Typography color="textPrimary">No endpoints to display...</Typography>}
      />
        </ListItemButton>
      </ListItem>
    );
  };

    return (
      <Box
        sx={{ width: '100%', height: 400, maxWidth: 360, bgcolor: 'background.paper'}}
      >
        <FixedSizeList
          height={window.innerHeight}
          width={window.innerWidth}
          itemSize={46}
          itemCount={endpoints.length ? endpoints.length: 1}
          overscanCount={5}
        >
          {endpoints.length === 0 ? renderSingleRow : renderRow}
        </FixedSizeList>
      </Box>
    );
   }

