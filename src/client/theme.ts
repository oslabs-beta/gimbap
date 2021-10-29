import { createTheme, Theme } from '@mui/material/styles';

export const lightTheme: Theme = createTheme({
  // typography: {
  //   fontFamily: [
  //     'Roboto',
  //     'Arial',
  //     'Helvetica',
  //     'sans-serif'
  //   ].join(',')
  // }
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

// const getDesignTokens = (mode: PaletteMode) => ({
//   palette: {
//     mode,
//     ...(mode === 'light'
//       ? {
//           // palette values for light mode
//           primary: amber,
//           divider: amber[200],
//           text: {
//             primary: grey[900],
//             secondary: grey[800],
//           },
//         }
//       : {
//           // palette values for dark mode
//           primary: deepOrange,
//           divider: deepOrange[700],
//           background: {
//             default: deepOrange[900],
//             paper: deepOrange[900],
//           },
//           text: {
//             primary: '#fff',
//             secondary: grey[500],
//           },
//         }),
//   },
// });

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
