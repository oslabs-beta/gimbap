import React from 'react';

import Typography from '@mui/material/Typography';

export default function VisualizingYourData() {
  return (<>
    <Typography variant='h4' component='h2' id='visualizing-your-data' color='textPrimary' pt={3}>Visualizing Your Data</Typography>

    <Typography variant='h6' color='textPrimary'>
      Cluster Tree
    </Typography>
    <Typography variant='body1' id='visualizing-your-data-body' color='textPrimary'>
      Data is processed through Gimbap’s clustering algorithm and a dendrogram is generated that visualizes endpoint clustering recommendations based on similar covariant scores.
    </Typography>

    <Typography variant='h6' color='textPrimary'>
      Load Graph
    </Typography>
    <Typography variant='body1' id='visualizing-your-data-body' color='textPrimary'>
      Dive into more in-depth metrics using Gimbap’s load graphs. Developers are able to analyze recommended clusters in addition to monitoring the call times of individual routes within their application.
    </Typography>
  </>);
}
