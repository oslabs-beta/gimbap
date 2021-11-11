import { createTheme, Theme } from '@mui/material/styles';

export const lightTheme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3559A4',
    },
    secondary: {
      main: '#3559A4',
    },
    error: {
      main: '#3559A4',
    },
    warning: {
      main: '#3559A4',
    },
    divider: '#28A78D',
  },
});

export const darkTheme: Theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main:'#fff',
    },
          divider: '#242423',
          background: {
            default: '#E24B44',
            paper: '#242423',
          },
          text: {
            primary: '#fff',
            secondary: '#fff',
          },

  }
});
