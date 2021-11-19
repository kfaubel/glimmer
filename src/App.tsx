import React from "react";
import { useParams } from "react-router-dom";

import './App.css';

import ViewerScreen from "./components/ViewerScreen"

// withRouter was dropped from react v6.  This is the little part that enabled params 
// and works with React class components.
// 
// Next step will be to rewrite this using functional components.
const withRouter = (WrappedComponent: any) => {
    return (props: any) => {
        const params = useParams();
    
        return (
            <WrappedComponent
                {...props}
                params={params}
            />
        );
    };
};

interface AppParams {
    profile: string;
}
interface AppProps {
    params: AppParams;
    x?: string;
};

class App extends React.Component<AppProps>  {
    profile = "";
    constructor(props: AppProps) {
        super(props);

        if (typeof this.props.params.profile === "string")
           this.profile = this.props.params.profile;
        else
            this.profile = ""; // Profile was not specified

        console.log(`Profile: ${this.profile}`)

        this.state = {
            publicUrlPrefix: "",
        };
    }

    render(): React.ReactNode {
        return (
            <div>
                <ViewerScreen profile={this.profile} />
            </div>
        )
    }
}

export default withRouter(App);