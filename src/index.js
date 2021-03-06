import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { ThemeProvider, CSSReset } from "@chakra-ui/core"; 
import customTheme from "./theme.js";
import storage from './helpers/storage'

function hasStorage() {
  return storage.getCurrentLogin() && storage.getDebtRecords() && storage.getUsers()
}

if (!hasStorage()) {
  storage.initializeData()
}

ReactDOM.render(
  <ThemeProvider theme={customTheme}>
    <CSSReset />
    <App />
  </ThemeProvider>
, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorkerRegistration.register();