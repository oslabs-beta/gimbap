import React from 'react';
import ReactDOM from 'react-dom';

import './index.scss';
import 'normalize.css';

import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from './theme';
import App from './App';

ReactDOM.render(
  <ThemeProvider theme={lightTheme}>
    <App />
  </ThemeProvider>,
  document.getElementById('root')
);
