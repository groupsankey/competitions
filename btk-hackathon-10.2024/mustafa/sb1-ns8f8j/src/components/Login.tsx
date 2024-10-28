// src/components/Login.tsx
import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('student'); // Default role

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ username, role }); // Pass the user data back to the parent
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col p-4">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mb-2 p-2 border"
      />
      <select value={role} onChange={(e) => setRole(e.target.value)} className="mb-2 p-2 border">
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
      </select>
      <button type="submit" className="bg-blue-500 text-white p-2">Login</button>
    </form>
  );
};

export default Login;
