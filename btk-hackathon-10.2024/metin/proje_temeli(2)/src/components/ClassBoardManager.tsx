// src/components/ClassBoardManager.tsx
import React, { useState } from 'react';

const ClassBoardManager = ({ onCreateBoard }) => {
  const [boardName, setBoardName] = useState('');

  const handleCreateBoard = () => {
    onCreateBoard(boardName);
    setBoardName('');
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Board Name"
        value={boardName}
        onChange={(e) => setBoardName(e.target.value)}
        className="mb-2 p-2 border"
      />
      <button onClick={handleCreateBoard} className="bg-green-500 text-white p-2">Create Board</button>
    </div>
  );
};

export default ClassBoardManager;

