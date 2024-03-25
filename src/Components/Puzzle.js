import { React, useState, useRef } from 'react'

function Puzzle({ x, y, image, setMoveIndex, id, setPointer, imgSize, imgShift}) {
    const handleTouchMove = (e) => {
        let touch = e.changedTouches[0];
        setMoveIndex(id);
        let rect = e.target.getBoundingClientRect();
        setPointer({x: touch.clientX - rect.left, y: touch.clientY - rect.top});
    }
    const handleMouseMove = (e) => {
        setMoveIndex(id);
        let rect = e.target.getBoundingClientRect();
        setPointer({x: e.clientX - rect.left, y: e.clientY - rect.top});
    }
    return (
        <div className="puzzle" style={{ top: `${y + imgShift}px`, left: `${x + imgShift}px` }} onTouchStart={handleTouchMove} onMouseDown={handleMouseMove}>
            <img src={image} style={{top: -imgShift, left: -imgShift}} className="puzzle-image" width={imgSize} height={imgSize}/>
        </div>
    );
}

export default Puzzle
