// src/App.tsx
import { useEffect, useState } from 'react';
import { api } from './services/api';

type User = {
  id: number;
  name: string;
};

function App() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api.get<User[]>('/users')
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error: any) => {
        console.error('Error al obtener usuarios:', error);
      });
  }, []);

  return (
    <div>
      <h1>Usuarios</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
