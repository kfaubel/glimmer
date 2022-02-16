import "./App.css";
import TimeBug from "./TimeBug";
import Message from "./Message";
import { Sequence, ScreenItem } from "./Sequence";
import React from "react";

export interface AppProps {
    sequencer: Sequence;
}

let timeout: NodeJS.Timeout;

const App = (props: AppProps) => {
//function App(props: AppProps) {
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
    //const [screen, updateScreen] = React.useState<ScreenItem>(props.sequencer.getFirst());
    //const [className, updateClassName] = React.useState<string>("fadeOut");

    const [screenState, updateScreenState] = React.useState({screen: props.sequencer.getFirst(), fade: ""});
   
    console.log(`${new Date().toLocaleString()}:${new Date().getMilliseconds()}: App starting  screen: ${screenState.screen.friendlyName}, fade: ${screenState.fade}`);

    const fadeOut = (screen: any) => {
        console.log(`${new Date().toLocaleString()}:${new Date().getMilliseconds()}: fadeOut(): screen: ${screen.friendlyName}, Updating fade prop to: fadeOut`);
        updateScreenState({screen: screen, fade: "fadeOut"}); 
        setTimeout(fadeInNew, 100, screen);  
    };

    // Set the update trigger when this image has been displayed for long enough
    //clearTimeout(timeout); // Make sure we don't somehow get 2 of these queued
    //timeout = setTimeout(fadeOut, (screenState.screen as ScreenItem).displaySecs * 1000);  

    const fadeInNew = (screen: any) => {
        const newScreen = props.sequencer.getNext();
        console.log(`${new Date().toLocaleString()}:${new Date().getMilliseconds()}: fadeInNew(): Previous screen: ${screen.friendlyName}, fade: ${screenState.fade}`);
        console.log(`${new Date().toLocaleString()}:${new Date().getMilliseconds()}: fadeInNew(): Updating screen: ${newScreen.friendlyName}, fade: fadeIn`);
        
        updateScreenState({screen: newScreen, fade: "fadeIn"});

        clearTimeout(timeout); // Make sure we don't somehow get 2 of these queued
        timeout = setTimeout(fadeOut, (newScreen as ScreenItem).displaySecs * 1000, newScreen);  
    }

    if (screenState.fade === "") {
        console.log(`${new Date().toLocaleString()}:${new Date().getMilliseconds()}: First time, setting fadeOut timeout`);
        timeout = setTimeout(fadeOut, 10000, screenState.screen);
    } 

    // Let the image go black with the fadeOut and, after 1000ms, start the fade in
    //setTimeout(animate, 1000);  

    console.log(`${new Date().toLocaleString()}:${new Date().getMilliseconds()}: App returning screen: ${(screenState.screen as ScreenItem).friendlyName}, className: ${screenState.fade}`);
    //console.log(JSON.stringify(screenState.screen, null, 4));
    return (
        <div className="App" id="myApp">
            <img className={screenState.fade} 
                 id="screen-image" 
                 src={(screenState.screen as ScreenItem).imageUri} 
                 alt={(screenState.screen as ScreenItem).friendlyName}
            />
            <TimeBug location={(screenState.screen as ScreenItem).timeBug} />
            <Message message={(screenState.screen as ScreenItem).message} />
        </div>
    );
}

export default App;
