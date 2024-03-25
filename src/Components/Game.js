import React from 'react';
import { useState } from 'react';
import Field from './Field';
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

function Game() {
    const [newGameId, setNewGameId] = useState('');
    const [client, setClient] = useState(undefined);
    const [existingGameId, setExistiongGameId] = useState('')
    const [puzzlesCount, setPuzzlesCount] = useState('');
    const [file, setfile] = useState(undefined);
    const createGame = () => {
        if(file === undefined){
            alert("Choose file first");
            return;
        }
        let formData = new FormData();
        formData.append("file", file);
        fetch(`http://localhost:8080/api/game/create?puzzles_count=${puzzlesCount}`, {
            method: "POST",
            credentials: "include",
            body: formData
        }).then(response => {
            if (response.status === 200) {
                response.json().then(json => {
                    setNewGameId(json.gameId);
                });
            } else {
                console.log(`Can't create game, status ${response.status}`)
            }
        });
    }

    const joinGame = (gameId) => {
        let stompClient = new Client();
        stompClient.webSocketFactory = () => {
            return new SockJS(`http://localhost:8080/pzl-game`);
        }
        stompClient.connectHeaders = { gameId };
        setClient(stompClient)
    }

    const changeFile = (e) => {
        setfile(e.target.files[0]);
    }

    const getGameMenu = () => {
        if (newGameId !== '') {
            return (
                <div>
                    <span>Game Id is {newGameId}</span>
                    <button onClick={() => joinGame(newGameId)}>Join</button>
                </div>
            )
        } else {
            return (
                <div>
                    <input type="file" onChange={changeFile}/>
                    <label>
                        Puzzles count: 
                        <input type="number" value={puzzlesCount} onChange={e => setPuzzlesCount(e.target.value)}/>
                    </label>
                    <button type="button" onClick={createGame}>Create game</button>
                    <div>
                        <label>
                            Join existing game:
                            <input type="text" value={existingGameId} onChange={(e) => setExistiongGameId(e.target.value)} />
                        </label>
                        <button type="button" onClick={() => joinGame(existingGameId)}>Join game</button>
                    </div>
                </div>)
        }
    }
    return (
        <div>
            {getGameMenu()}
            {client !== undefined ? <Field client={client} gameId={existingGameId === '' ? newGameId : existingGameId} puzzleSize={60}/> : ""}
        </div>
    )
}

export default Game
