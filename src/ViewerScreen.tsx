import React from 'react';

import './App.css';
import { MyCanvas } from './components/Canvas';

import { Sequence, Screen } from "./Sequence";
//import Screen from "./Sequence";

interface ViewerProps {
}

interface ViewerState {
    image: any | null;
    name: string;
    displayTime: number;
}

class Viewer extends React.Component<ViewerProps, ViewerState> {
    
    sequence: Sequence;
    timeout: any | null;

    constructor(props: ViewerProps) {
        super(props);
        
        this.sequence = new Sequence();
        this.state = {
            image:     null,
            name: "null",
            displayTime: 0
        };

        this.timeout = null;
    }

    showNextScreen = (): void => {
        let nextItem: Screen = this.sequence.getNext();
        this.setState({
            image: nextItem.image,
            name: nextItem.resource,
            displayTime: nextItem.displaySecs            
        });
        console.log(`ViewerScreen::showNextScreen - ${nextItem.friendlyName}, for ${this.state.displayTime} secs`);

        this.timeout = setTimeout(() => {
            this.showNextScreen();
        }, this.state.displayTime * 1000)
    }

    async componentDidMount() {  
        await this.sequence.start();

        this.showNextScreen();

        //document.addEventListener('mousedown', this.handleClick);
    }

    componentWillUnmount() {
        if (this.timeout !== null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    // This is the handler for the mouse buttons.  In full screen it can be used to 
    // advance, rewind or logout  
    handleClick = (event: React.MouseEvent) => {
        console.log("Viewer::onClick", event.button);
        
        if (this.isInFullScreen()) {
            this.openFullscreen();
        } else {
            this.closeFullscreen();
        }
    }

    isInFullScreen = () => {
        return (document.fullscreenElement && document.fullscreenElement !== null);
         
        // return (document.fullscreenElement && document.fullscreenElement !== null) ||
        //     (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
        //     (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
        //     (document.msFullscreenElement && document.msFullscreenElement !== null)
    }

    openFullscreen = () => {
        //console.log("openFullScreen");
        var docElm = document.documentElement;
        console.dir(docElm);

        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        // } else if (docElm.mozRequestFullScreen) {
        //     docElm.mozRequestFullScreen();
        // } else if (docElm.webkitRequestFullScreen) {
        //     docElm.webkitRequestFullScreen();
        // } else if (docElm.msRequestFullscreen) {
        //     docElm.msRequestFullscreen();
        }
    }

    /* Close fullscreen */
    closeFullscreen = () => {
        //console.log("closeFullScreen");
        if (document.exitFullscreen) {
            document.exitFullscreen();
        // } else if (document.webkitExitFullscreen) {
        //     document.webkitExitFullscreen();
        // } else if (document.mozCancelFullScreen) {
        //     document.mozCancelFullScreen();
        // } else if (document.msExitFullscreen) {
        //     document.msExitFullscreen();
        }
    }

    render() {
        //console.log("Viewer::render");
        return (
            <div id="myViewer" className="Viewer">
                <MyCanvas image ={this.state.image} name = {this.state.name}/>
            </div>
        )
    }
}

export default Viewer;