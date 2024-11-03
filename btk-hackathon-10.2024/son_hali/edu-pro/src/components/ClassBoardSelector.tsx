import React, { useState } from 'react';
import { classes } from '../data';

export default function ClassBoardSelector({ onSelectBoard }) {
  const [selectedClass, setSelectedClass] = useState(null);

  return (
    <div>
      <h2>Select a Class</h2>
      <ul>
        {classes.map((cls) => (
          <li key={cls.id} onClick={() => setSelectedClass(cls)}>
            {cls.name}
          </li>
        ))}
      </ul>

      {selectedClass && (
        <>
          <h3>Select a Board in {selectedClass.name}</h3>
          <ul>
            {selectedClass.boards.map((board) => (
              <li key={board.id} onClick={() => onSelectBoard(board)}>
                {board.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
