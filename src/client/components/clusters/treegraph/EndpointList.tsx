import * as React from 'react';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { getListItemIconUtilityClass } from '@mui/material';

// function renderRow(props: ListChildComponentProps) {
//   const { index, style } = props;

//   return (
//     <ListItem style={style} key={index} component="div" disablePadding>
//       <ListItemButton>
//         <ListItemText primary={`Item ${index + 1}`} />
//       </ListItemButton>
//     </ListItem>
//   );
// }


export default function EndpointList(props) {
  const { endpoints } = props;


  function renderRow(props: ListChildComponentProps) {
    const { index, style } = props;
    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton>
          <ListItemText primary={`${endpoints[index]?.name}`} />
        </ListItemButton>
      </ListItem>
    );
  }

  const renderSingleRow = (props: ListChildComponentProps) => {
    const { index, style } = props;
    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton>
          <ListItemText primary={'No endpoints to show...'} />
        </ListItemButton>
      </ListItem>
    );
  }

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