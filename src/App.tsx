import { useState } from 'react';
import AppRouter from './routes/AppRouter';
import './index.css';

function App() {
  const [user, setUser] = useState<any>(null);

  return (
    <AppRouter user={user} setUser={setUser} />
  );
}

export default App;
