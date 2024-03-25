import React, { useState } from 'react'
import Signin from './Signin';
import Signup from './Signup';

function Authorization() {
    const [mode, setMode] = useState("none");
    const getMenu = () => {
        switch (mode) {
            case "none": return (<div className="menu-holder">
                <button onClick={e => setMode("signin")}>Signin</button>
                <button onClick={e => setMode("signup")}>Login</button>
            </div>); 

            case "signin": return <Signin />;
            case "signup": return <Signup/>;
            default: return <div>No such state</div>
        }
    }
    return (
        <div>
            {mode !== "none" ? <button onClick={e => setMode("none")}>Back</button> : ""}
            {getMenu()}
        </div>
    )
}

export default Authorization
