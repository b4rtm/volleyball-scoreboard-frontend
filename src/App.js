import { WebSocketProvider } from './WebSocketContext';
import Login from './pages/Login';
import StartPage from './pages/StartPage';
import {Route, Routes, BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <WebSocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/start" element={<StartPage/>} />
        </Routes>
      </BrowserRouter>

    </WebSocketProvider>
  );
}

export default App;
