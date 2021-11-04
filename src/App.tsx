import React, { ReactNode } from 'react';
import './App.css';

import ViewerScreen from "./ViewerScreen"

interface AppProps {
}

class App extends React.Component {

    constructor(props: AppProps) {
        super(props);
        //this.sequence = new Sequence("url");

        this.state = {
            publicUrlPrefix: "",
        };
    }

    render(): ReactNode {
        // console.log(`App::render - PUBLIC_URL=${this.state.publicUrlPrefix}`)

        return (
            <div>
                
                    <ViewerScreen />
                
            </div>
        )
    }
}

export default App;