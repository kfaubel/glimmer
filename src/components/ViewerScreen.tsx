import React from 'react';
import { MyCanvas } from "./Canvas";
import TimeBug from "./TimeBug"
import { Sequence, Screen } from "../Sequence";

interface ViewerProps {
    profile: string;
}

interface ViewerState {
    image: any | null;
    type: string;
    resource: string;
    displayTime: number;
    message: string;
    timeBug: string;
}

class Viewer extends React.Component<ViewerProps, ViewerState> {
    
    sequence: Sequence;
    timeout: any | null;

    constructor(props: ViewerProps) {
        super(props);
        
        this.sequence = new Sequence(this.props.profile);
        this.state = {
            image:     null,
            type: "",
            resource: "",
            displayTime: 0,
            message: "",
            timeBug: ""
        };

        console.log(`ViewerScreen: profile: ${this.props.profile}`);

        this.timeout = null;
    }

    showFirstScreen = (): void => {
        this.setState({
            image: null,
            type: "time",
            resource: "",
            displayTime: 20,
            message: "Starting...",
            timeBug: ""          
        });

        console.log(`ViewerScreen::showFirstScreen for ${this.state.displayTime} secs`);

        this.timeout = setTimeout(() => {
            this.showNextScreen();
        }, this.state.displayTime * 1000)
    }


    showNextScreen = (): void => {
        let nextItem: Screen = this.sequence.getNext();
        this.setState({
            image: nextItem.image,
            type: nextItem.type,
            resource: nextItem.resource,
            displayTime: nextItem.displaySecs,
            message: nextItem.message,   
            timeBug: nextItem.timeBug       
        });

        console.log(`ViewerScreen::showNextScreen - ${nextItem.type} ${nextItem.friendlyName}, for ${this.state.displayTime} secs`);

        this.timeout = setTimeout(() => {
            this.showNextScreen();
        }, this.state.displayTime * 1000)
    }

    async componentDidMount() {  
        await this.sequence.start();

        this.showFirstScreen();

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
        console.log(`Viewer::render: ${this.state.resource}, bug:${this.state.timeBug}, msg: ${this.state.message}`);
        return (
            <div id="myViewer" className="Viewer">
                <MyCanvas type = {this.state.type} image = {this.state.image} resource = {this.state.resource} message = {this.state.message}/>
                <TimeBug timeBug = {this.state.timeBug}/>
            </div>
        )
    }
}

export default Viewer;