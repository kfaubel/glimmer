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
    //console.log("In App Props: " + JSON.stringify(props, null, 4));
    //console.trace("In App...");

    // Steps
    // * setup the useState hook to get the update function for the screen
    // * setup the useState hook to get the update function for the timeout 
    // * Start the timeout cycle if the current timeout is undefined

    // useState take a value with the initial value or a function that returns the initial value
    // useState return an array with two value, 
    // - first is the current value of the state variable
    // - second is a function that we can use to assign new values 
    const [screen, updateScreen] = React.useState<ScreenItem>(props.sequencer.getFirst());
    const [className, updateClassName] = React.useState<string>("fadeOut");
   
    console.log(`${new Date().toLocaleString()}:${new Date().getMilliseconds()}: In App: screen: ${screen.friendlyName}, className: ${className}`);

    const fadeOut = () => {
        console.log(`${new Date().toLocaleString()}:${new Date().getMilliseconds()}: In timeout function fadeOut: Updating className to: fadeOut`);
        updateClassName("fadeOut"); // This is really just a quick switch to opacity 0 to show the black background  
        setTimeout(fadeInNew, 1000);  
    };

    // Set the update trigger when this image has been displayed for long enough
    clearTimeout(timeout); // Make sure we don't somehow get 2 of these queued
    timeout = setTimeout(fadeOut, (screen as ScreenItem).displaySecs * 1000);  

    const fadeInNew = () => {
        console.log(`${new Date().toLocaleString()}:${new Date().getMilliseconds()}: In timeout function fadeInNew: Updating screen with next image. Updating to fadeIn`);
        updateScreen(props.sequencer.getNext());
        updateClassName("fadeIn");
    }

    // Let the image go black with the fadeOut and, after 1000ms, start the fade in
    //setTimeout(animate, 1000);  

    console.log(`${new Date().toLocaleString()}:${new Date().getMilliseconds()}: App returning screen: ${(screen as ScreenItem).friendlyName}, className: ${className}`);
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
