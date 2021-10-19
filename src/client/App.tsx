import React from 'react';
// import * as ReactDOM from 'react-dom';
import MainContainer from './components/MainContainer';
import NavigationBar from './components/NavigationBar';

export default function App() {
  return(
    <div id="app">
      <NavigationBar />
      <MainContainer />
    </div>
  );
}
