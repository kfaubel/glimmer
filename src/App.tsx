import React from "react";
import { useParams } from "react-router-dom";

import './App.css';

import ViewerScreen from "./ViewerScreen"

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

    constructor(props: AppProps) {
        super(props);

        console.log(`Profile: ${this.props.params.profile}`)

        this.state = {
            publicUrlPrefix: "",
        };
    }

    render(): React.ReactNode {
        return (
            <div>
                <ViewerScreen profile={this.props.params.profile}/>
            </div>
        )
    }
}

export default withRouter(App);