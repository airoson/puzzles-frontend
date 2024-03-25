import React, { useState } from 'react'

function Signin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [status, setStatus] = useState(''); 
    const [message, setMessage] = useState('');
    const processRegistration = (e) => {
        e.preventDefault();
        fetch("http://localhost:8080/api/signin", {
            method: "POST",
            headers:{
                "Content-type": "application/json"
            },
            body: JSON.stringify({name, email, password})
        }).then(response => {
            if(response.status == 200){
                return response.json().then(json => {
                    if(json.status === "SUCCESS"){
                        setStatus("success");
                        setMessage(`Account created, userId is ${json.id}`)
                    }else{
                        setStatus("fault");
                        setMessage(json.message)
                    }
                })
            }else{
                console.log(`Registration failed with code ${response.status}, data ${response}`)
            }
        })
    }
    return (
        <div>
            <form>
                <label>
                    Name:
                    <input type="text" value={name} onChange={e => setName(e.target.value)}/>
                </label>
                <label>
                    Email:
                    <input type="text" value={email} onChange={e => setEmail(e.target.value)}/>
                </label>
                <label>
                    Password:
                    <input type="text" value={password} onChange={e => setPassword(e.target.value)}/>
                </label>
                <button onClick={processRegistration}>Signin</button>
            </form>
            {status !== ''? <div className={status}>{message}</div>: ""}
        </div>
    )
}

export default Signin
