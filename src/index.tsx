import ReactDOM from 'react-dom';
import App from './App';
import { Sequence } from './Sequence';

import 'bootstrap/dist/css/bootstrap.min.css';

const sequence = new Sequence("ken");
sequence.start(); // Loads the screen list, sets an interval timer to update each screen image.

ReactDOM.render(
    <App sequencer = {sequence}/>, document.getElementById('root')
);