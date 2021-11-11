import React from 'react';

import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';


export default function Contributors() {
  return (<>
    <Typography variant='h4' component='h2' id='contributors' color='textPrimary' pt={3}>Contributors</Typography>
    <Link href='https://github.com/vngelynn' target='_blank' variant='body1'>Angelynn Truong</Link>
    <Link href='https://github.com/khandkerislam' target='_blank' variant='body1'>Khandker Islam</Link>
    <Link href='https://github.com/miguelh72' target='_blank' variant='body1'>Miguel Hernandez</Link>
    <Link href='https://github.com/Parker9706' target='_blank' variant='body1'>Parker Hutcheson</Link>
    <Link href='https://github.com/SebastienFauque' target='_blank' variant='body1'>Sebastien Fauque</Link>
  </>);
}
