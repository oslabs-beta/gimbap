import React from 'react';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

export default function ApiTableOfContents() {
  return (<Stack ml={4} pb={3}>
    <Link href='#types' variant='body1'>Types</Link>
    <Link href='#gimbap' variant='body1'>Gimbap</Link>
    <Link href='#setup' variant='body1'>Setup</Link>
    <Link href='#endpointmodel' variant='body1'>EndpointModel</Link>
    <Link href='#endpointbucketsmodel' variant='body1'>EndpointBucketsModel</Link>
    <Link href='#clustermodel' variant='body1'>ClusterModel</Link>
    <Link href='#endpoints-utility' variant='body1'>Endpoints Utility</Link>
    <Link href='#data-generator' variant='body1'>Data Generator</Link>
  </Stack>);
}
