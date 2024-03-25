import React, { useEffect, useState, useRef } from 'react'
import Puzzle from './Puzzle';
import Timer from './Timer';

function Field({ client, gameId }) {
    const [puzzles, setPuzzles] = useState([]);
    const [moveIndex, setMoveIndex] = useState(undefined);
    const [moveSendAllowed, setMoveSendAllowed] = useState(true);
    const [pointer, setPointer] = useState(undefined);
    const [status, setStatus] = useState("Not solved");
    const [field, setField] = useState({ local: { width: 0, height: 0, gridHeight: 0 }, coef: 0.0, puzzleSize: 0 })
    const [imageOffset, setImageOffset] = useState({})
    const [users, setUsers] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const fieldRef = useRef(null);

    const onPuzzleMove = (coef) => {
        return (message) => {
            const updates = JSON.parse(message.body);
            console.log("Receiving move", updates);
            movePuzzle(updates.puzzles.map(p => {return {id: p.id, x: Math.floor(p.x * coef), y: Math.floor(p.y * coef)}}));
        }
    } 

    const movePuzzle = (updates) => {
        console.log(`In movePuzzles function`, updates)
        setPuzzles(puzzles => {
            let np = [];
            for (let p of puzzles) {
                let up = updates.find(u => u.id === p.id)
                if (up !== undefined) {
                    p.x = up.x;
                    p.y = up.y;
                    p.inGame = true;
                    if (up.componentId !== undefined) {
                        p.componentId = up.componentId;
                    }
                }
                np.push({ ...p });
            }
            return np;
        });
    }

    const onStateUpdate = (message) => {
        const currentState = JSON.parse(message.body);
        console.log(currentState)
        if (currentState.state === "FINE" || currentState.state === "SOLVED") {
            if (currentState.puzzles !== undefined) {
                let puzzleTemp = document.createElement("div")
                puzzleTemp.classList.add("puzzle")
                document.body.appendChild(puzzleTemp);
                let puzzleSize = puzzleTemp.clientWidth;
                puzzleTemp.remove();
                console.log("Puzzle size : ", puzzleSize);
                let imgShift = Number(puzzleSize * 0.34247);
                let imgSize = 2 * imgShift + puzzleSize;
                setImageOffset({ imgShift, imgSize });
                let width = puzzleSize * (currentState.width + 4) + (currentState.width - 1) * imgShift;
                let coef = width / 10000;
                let height = Math.floor(currentState.fieldHeight * coef)
                console.log("width = ", width, " fieldWidth", currentState.fieldWidth);
                let gridHeight = Math.floor(currentState.gridHeight * coef);
                setField({
                    puzzleSize,
                    coef,
                    local: { width, height, gridHeight }
                });
                client.subscribe("/user/queue/updates", onPuzzleMove(coef));
                client.subscribe("/user/queue/connects", onNewConnect(coef));
                setPuzzles(currentState.puzzles.map(p => { return { ...p, x: Math.floor(p.x * coef), y: Math.floor(p.y * coef) } }));
            }
            if (currentState.users !== undefined)
                setUsers(currentState.users);
            if (currentState.seconds !== undefined)
                setSeconds(currentState.seconds);
        }
        else console.log("Can't read puzzles state");
    }

    const onNewConnect = (coef) => {
        return (message) => {
            let updates = JSON.parse(message.body);
            console.log("New connect", updates);
            if (updates.status === "SOLVED") setStatus("Solved");
            if (updates.connects) movePuzzle(updates.connects.map(p => {return {id: p.id, componentId: p.componentId, x: Math.floor(p.x * coef), y: Math.floor(p.y * coef)}}));
        }
    }  

    const onConnect = () => {
        client.subscribe("/user/queue/state", onStateUpdate);
        client.publish({ destination: "/game/state", body: "" });
    }

    useEffect(() => {
        client.onConnect = onConnect;
        client.activate();
    }, []);

    const handleTouchMove = (e) => {
        //e.preventDefault();
        console.log("Handling touch move")
        let touch = e.changedTouches[0];
        console.log(touch)
        if (moveIndex !== undefined && pointer != undefined && moveSendAllowed) {
            performLocalMove(Math.floor(touch.clientX), Math.floor(touch.clientY));
        }
    }

    const performLocalMove = (clientX, clientY) => {
        console.log(`clientX: ${clientX} clientY: ${clientY}`)
        let rect = fieldRef.current.getBoundingClientRect();
        let x = Math.floor(clientX - rect.x - pointer.x), y = Math.floor(clientY - rect.y - pointer.y);
        console.log(`x = ${x}, y = ${y}`)
        let cp = puzzles[moveIndex];
        let component = cp.componentId
        let movementX = x - cp.x, movementY = y - cp.y;
        let updates = puzzles.filter(p => p.componentId === component).map(p => { return {...p, id: p.id, x: p.x + movementX, y: p.y + movementY } })
        if(updates.some((p) => {
            return p.x + imageOffset.imgShift < 0 || p.x + imageOffset.imgShift + field.puzzleSize > field.local.width
                    || p.y + imageOffset.imgShift < 0 || p.y + imageOffset.imgShift + field.puzzleSize > field.local.height + field.local.gridHeight })){
            return;
        }
        client.publish({
            destination: "/game/moves", body: JSON.stringify({
                id: moveIndex,
                x: Math.ceil(x / field.coef),
                y: Math.ceil(y / field.coef)
            })
        });
        movePuzzle(updates)
        setMoveSendAllowed(false);
        setTimeout(() => setMoveSendAllowed(true), 1);
    }

    const handleMouseMove = (e) => {
        e.preventDefault();
        console.log("Handling mouse move");
        if (moveIndex !== undefined && pointer != undefined && e.buttons === 1 && moveSendAllowed) {
           performLocalMove(e.clientX, e.clientY);
        }
    }

    const getDist = (p1, p2) => {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    const handleMouseUp = (e) => {
        //e.preventDefault();
        if (moveIndex === undefined) return;
        let shiftX = [[field.puzzleSize, 0], [field.puzzleSize / 2, field.puzzleSize / 2], [0, field.puzzleSize], [field.puzzleSize / 2, field.puzzleSize / 2]],
            shiftY = [[field.puzzleSize / 2, field.puzzleSize / 2], [field.puzzleSize, 0], [field.puzzleSize / 2, field.puzzleSize / 2], [0, field.puzzleSize]];
        let movedComponent = puzzles[moveIndex].componentId;
        let movedPuzzles = puzzles.filter(p => p.componentId === movedComponent);
        for (let puzzle of movedPuzzles) {
            let conFound = false;
            for (let i = 0; i < 4; i++) {
                if (puzzle.neighbors[i] === -1) continue;
                let connect = puzzles[puzzle.neighbors[i]];
                console.log("Connect: ", connect);
                if (!connect.inGame) continue;
                if (connect.componentId === movedComponent) continue;
                if (getDist(
                    { x: puzzle.x + shiftX[i][0], y: puzzle.y + shiftY[i][0] },
                    { x: connect.x + shiftX[i][1], y: connect.y + shiftY[i][1] }
                ) < 10) {
                    let x = connect.x + [-field.puzzleSize, 0, field.puzzleSize, 0][i];
                    let y = connect.y + [0, -field.puzzleSize, 0, field.puzzleSize][i];
                    client.publish({
                        destination: "/game/connects",
                        body: JSON.stringify({
                            puzzle1Id: connect.id,
                            puzzle2Id: puzzle.id
                        })
                    });
                    let movementX = x - puzzle.x, movementY = y - puzzle.y;
                    let updates = movedPuzzles.map(p => {
                        return { ...p, id: p.id, x: p.x + movementX, y: p.y + movementY, componentId: connect.componentId }
                    });
                    console.log("Moving puzzles due to connect: ", updates);
                    movePuzzle(updates);
                    setMoveSendAllowed(false);
                    setTimeout(() => setMoveSendAllowed(true), 1);
                    conFound = true;
                    break;
                }
            }
            if (conFound) break;
        }
        setMoveIndex(undefined);
        setPointer(undefined);
    }
    return (
        <div>
            <div>Status: {status}</div>
            <div>
                Time: <Timer seconds={seconds} /> <span>Users: {users}</span>
            </div>
            <div className='image-holder'>
                <div>
                    Curretn image
                </div>
                <div>
                    <img className="full-image" src={`http://localhost:8080/api/image?image_id=${gameId}`} />
                </div>
            </div>
            <div className="field-holder" onMouseMove={handleMouseMove} onTouchMove={handleTouchMove} onTouchEnd={handleMouseUp} onMouseUp={handleMouseUp}>
                <div className="game-field" ref={fieldRef} style={{ width: `${field.local.width}px`, height: `${field.local.height}px` }}>
                    {puzzles.map((puzzle, i) => <Puzzle id={puzzle.id} key={i} x={puzzle.x} y={puzzle.y} image={`http://localhost:8080/api/image?image_id=${gameId}-${puzzle.originalId}`}
                        setMoveIndex={setMoveIndex} setPointer={setPointer} imgSize={imageOffset.imgSize} imgShift={imageOffset.imgShift} />)}
                </div>
                <div className="puzzle-grid" style={{ width: `${field.local.width}px`, height: `${field.local.gridHeight}px` }}>

                </div>
            </div>
        </div>
    )
}

export default Field
