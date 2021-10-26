import React from 'react';

import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { darkTheme, lightTheme } from './../../theme';



export default function TableOfContents({
  showApiDocPage
}: {
  showApiDocPage: () => void;
}) {
  return (<>
    <Typography variant="h4" component="h2" id="table-of-contents" color="textPrimary">Table of Contents</Typography>
    <Stack ml={4}>
      <Link href="#intro" variant="body1">Intro</Link>
      <Link href="#installation" variant="body1">Installation</Link>
      <Link href="#visualizing-your-data" variant="body1">Visualizing Your Data</Link>
      <Link variant="body1" onClick={showApiDocPage}>API</Link>
      <Link href="#credits" variant="body1">Credits</Link>
    </Stack>
  </>);
}
