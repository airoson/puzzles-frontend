import React from 'react'

function GridPuzzle({ image, setMoveIndex, index, setPointer, imgSize, imgShift, row, col }) {
    const setFocusonPuzzle = (e) => {
        document.querySelectorAll(".puzzle").forEach(puzzle => puzzle.classList.remove("puzzle-move"));
        e.target.classList.add("puzzle-move");
        setMoveIndex(index);
        let rect = e.target.getBoundingClientRect();
        setPointer({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    return (
        <div className="puzzle-holder" style={{height: `${imgSize}px`, gridRowStart: row, gridColumnStart: col}}>
            <div className="puzzle-in-grid"  onMouseDown={setFocusonPuzzle}>
                <img src={image} style={{ top: -imgShift, left: -imgShift }} className="puzzle-image" width={imgSize} height={imgSize} />
            </div>
        </div>
    );
}

export default GridPuzzle
