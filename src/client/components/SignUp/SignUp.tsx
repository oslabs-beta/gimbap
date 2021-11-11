import React, { useState } from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';

import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

function Copyright(props: any) {
  return (
    <Typography
      variant='body2'
      color='text.secondary'
      align='center'
      {...props}
    >
      {'Copyright © '}
      <Link color='inherit' href='https://www.gimbap.io/' target='_blank'>
        gimbap.io
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const theme = createTheme();

export default function Mongo({ start }){
  const [connection, setConnection] = useState('');
  function mongoConnect() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mongodb: connection }),
    };
    fetch('api/mongo', requestOptions).then((response) => start(true));
  }

  return (
    <ThemeProvider theme={theme}>
      <Container component='main' maxWidth='xs'>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight : '100vh',
            justifyContent: 'center'
          }}
        >
          <Typography component='h1' variant='h2' sx={{ color:'#28A78D' }}>
            gimbap
          </Typography>
          <Box
            component='form'
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin='normal'
              required
              fullWidth
              id='mongo'
              label='Mongo Connection String Goes Here'
              name='mongo'
              autoFocus
              onChange={(event) => setConnection(event.target.value)}
            />
            <Button

              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
              onClick={()=>mongoConnect()}
            >
              Connect
            </Button>
            <Grid 
                container 
                direction='column'
                textAlign='center'
            >
              <Grid item>
                <Link
                  href='https://www.mongodb.com/cloud/atlas/register'
                  variant='body2'
                  target='_blank'
                >
                  {"Don't have MongoDB? Sign Up"}
                </Link>
              </Grid>
              <Grid item>
                <Copyright sx={{ mt: 4, mb: 4 }} />
              </Grid>
            </Grid>

          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
