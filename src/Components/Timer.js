import React, { useEffect, useState } from 'react'

function Timer(params) {
    const [seconds, setSeconds] = useState(params.seconds);
    useEffect(() => {
        let interval = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(interval);
    }, [seconds]);
    let h = Math.floor(seconds / 3600);
    let m = Math.floor(seconds % 3600 / 60);
    let s = seconds - h * 3600 - m * 60;
    return (
        <span>
            {h}:{("0" + m).slice(-2)}:{("0" + s).slice(-2)}
        </span>
    )
}

export default Timer
