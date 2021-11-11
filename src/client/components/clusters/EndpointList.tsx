import React, { useCallback } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

export default function EndpointList({
  width,
  height,
  methodName,
  clusterName,
  endpointList,
}: {
  width: number;
  height: number;
  methodName: string;
  clusterName: string;
  endpointList: string[];
}) {
  const renderRow = useCallback(({ index, style }: ListChildComponentProps) => {
    return (
      <ListItem style={style} key={index} component='div' disablePadding>
        <ListItemButton>
          <ListItemText disableTypography primary={<Typography color='textPrimary'> {endpointList.length === 0 ? 'No endpoints to show...' : endpointList[index]}</Typography>} />
        </ListItemButton>
      </ListItem>
    );
  }, [endpointList]);

  return (
    <Box
      sx={{
        width,
        height,
        bgcolor: 'background.paper',
        textAlign: 'center',
        border: 1,
        borderColor: 'black',
        borderRadius: 5,
        boxShadow: 10
      }}
    >
      <Typography color='textPrimary' variant='h4' mr={3} height={45} overflow={'hidden'}>
        {endpointList.length ? `${clusterName} - ${methodName} - ${endpointList.length} ` : null}
      </Typography>

      <FixedSizeList
        height={height - 60}
        width={width}
        itemSize={46}
        itemCount={endpointList.length ? endpointList.length : 1}
        overscanCount={5}
      >
        {renderRow}
      </FixedSizeList>
    </Box>
  );
}
