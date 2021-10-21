import { createTheme, Theme } from '@mui/material/styles';

export const lightTheme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3559a4',
    },
    secondary: {
      main: '#28a78d',
    },
    error: {
      main: '#e24b44',
    },
    warning: {
      main: '#f7b646',
    },
    divider: '#6C6C6C',
  },
});

export const darkTheme: Theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3559a4',
    },
    secondary: {
      main: '#28a78d',
    },
    error: {
      main: '#e24b44',
    },
    warning: {
      main: '#f7b646',
    },
    divider: '#6C6C6C',
    info: {
      main: '#F7B646',
    },
  },
});
