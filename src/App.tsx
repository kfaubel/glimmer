import "./App.css";
import TimeBug from "./TimeBug";
import Message from "./Message";
import { Sequence, ScreenItem } from "./Sequence";
import React from "react";

export interface AppProps {
    sequencer: Sequence;
}

let timeout: NodeJS.Timeout;

function App(props: AppProps) {

    // Steps
    // * setup the useState hook to get the update function for the screen
    // * setup the useState hook to get the update function for the timeout 
    // * Start the timeout cycle if the current timeout is undefined

    const [screen, updateScreen] = React.useState<ScreenItem>(props.sequencer.getFirst());
    const [className, updateClassName] = React.useState<string>("fadeOut");
   
    const update = () => {
        updateClassName("fadeOut"); // This is really just a quick switch to opacity 0 to show the black background
        updateScreen(props.sequencer.getNext());
    };

    const animate = () => {
        updateClassName("fadeIn");
    }

    // Set the update trigger when this image has been displayed for long enough
    clearTimeout(timeout); // Make sure we don't somehow get 2 of these queued
    timeout = setTimeout(update, (screen as ScreenItem).displaySecs * 1000);  

    // Let the image go black with the fadeOut and, after 10 seconds, start the fade in
    setTimeout(animate, 10); // start the 

    console.log(`${new Date().toLocaleString()}: App returning screen: ${(screen as ScreenItem).friendlyName}`);
    return (
        <div className="App" id="myApp">
            <img className={className} 
                 id="screen-image" 
                 src={(screen as ScreenItem).imageUri} 
                 alt={(screen as ScreenItem).friendlyName}
            />
            <TimeBug location={(screen as ScreenItem).timeBug} />
            <Message message={(screen as ScreenItem).message} />
        </div>
    );
}

export default App;
