import React from "react";
import {
    Switch,
    withRouter,
    Route
} from "react-router-dom";

import ViewerScreen from "./ViewerScreen"
import Sequence from "./Sequence" ;

import config from "./config.json";



// class Viewer extends React.Component {
class App extends React.Component {

    constructor(props) {
        super(props);
        this.sequence = new Sequence("url");

        this.state = {
            publicUrlPrefix: config.publicUrlPrefix,
            toViewer: false,
            toLogin: false,
            loginMessage: "Let's get started"

        };
    }

    exitViewer = (message) => {
        console.log(`App::exitViewer: message=${message}`);
        this.setState({ loginMessage: message, toLogin: true });
        this.props.history.push(this.state.publicUrlPrefix + '/');
    }

    // The real workhorse of React Router is the History library. Under the hood, it’s what’s keeping track 
    // of session history for React Router. When a component is rendered by React Router, 
    // that component is passed three different props: location, match, and history. This history prop comes 
    // from the History library and has a ton of fancy properties on it related to routing. In this case, 
    // the one we’re interested in is history.push. What it does is it pushes a new entry into the history stack 
    // - aka redirecting the user to another route.
    // The {...props} below pushs all the props down to the subordinate screens including 'history' OR NOT
    render() {
        // console.log(`App::render - PUBLIC_URL=${this.state.publicUrlPrefix}`)

        // Total fail.  This seems like the most straight forward way to do this
        // if (this.state.toViewer) {
        //     console.log("App:render - Redirect to viewer")
        //     return <Redirect to="/viewer" />
        // }

        return (
            <div>
                {/* A <Switch> looks through its children <Route>s and renders the first one that matches the current URL. */}
                <Switch>
                    <Route path={this.state.publicUrlPrefix + "/"} // "/viewer"}
                        render={(props) =>
                            <ViewerScreen {...props}
                                sequence={this.sequence}
                                exitViewer={this.exitViewer}
                                component={ViewerScreen} />
                        }
                    />
                </Switch>
            </div>
        )
    }
}

// The "withRouter" here makes it so that history is added to our props for the push redirect call
export default withRouter(App);
