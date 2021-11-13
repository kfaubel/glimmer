import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import './index.css';
import App from './App';
//import * as serviceWorker from './serviceWorker';

import 'bootstrap/dist/css/bootstrap.min.css';

//ReactDOM.render( < App / > , document.getElementById('root'));

// The StrictMode wrapper enables a bunch of validation checks to catch errors
ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route path=":profile" element={<App />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister(); 