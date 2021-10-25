import * as React from 'react';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

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
  console.log(endpoints);
  // const ourEndpoints = props.endpoints;
  // const generateList = (endpoints) => {
  //   endpoints.map((element, index)=>{
  //     <ListItem key={index} component="div" disablePadding>
  //       <ListItemText primary={element.name} />;
  //     </ListItem>
  //   });
  // };
  [{{}}, {{}}]

  function renderRow(props: ListChildComponentProps) {
    const { index, style } = props;
    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton>
          <ListItemText primary={`${endpoints[index + 1][index + 1].name}`} />
        </ListItemButton>
      </ListItem>
    );
  }

  return (
    <Box
      sx={{ width: '100%', height: 400, maxWidth: 360, bgcolor: 'background.paper'}}
    >
      <FixedSizeList
        height={400}
        width={360}
        itemSize={46}
        itemCount={200}
        overscanCount={5}
      >
        {renderRow}
      </FixedSizeList>
    </Box>
  );
}