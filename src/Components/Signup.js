import React from 'react'
import { useState } from 'react';

function Signup() {
    const [password, setPassword] = useState('');
    const [name, setName] = useState()
    const [status, setStatus] = useState('');
    const processLogin = (e) => {
        e.preventDefault();
        fetch('http://localhost:8080/api/signup', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({password, name})
        }).then(response => {
            if(response.status === 200){
                setStatus("Authenticated")
            }else{
                setStatus("Wrong credentials")
            }
        });
    }
    return (
        <div>
            <form>
                <label>
                    Name:
                    <input type="text" value={name} onChange={e => setName(e.target.value)}/>
                </label>
                <label>
                    Password:
                    <input type="text" value={password} onChange={e => setPassword(e.target.value)}/>
                </label>
                <button onClick={processLogin}>Signup</button>
            </form>
            {status !== '' ? <div>{status}</div>:""}
        </div>
    )
}

export default Signup
