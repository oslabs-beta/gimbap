import React from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function Splash() {
  return (
    <Box sx={{
      mx: 'auto', width: 40, mt: 5
    }}>
      < CircularProgress />
    </Box>
  );
}
