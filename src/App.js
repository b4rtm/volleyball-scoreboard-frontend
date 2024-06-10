import { WebSocketProvider } from './WebSocketContext';
import Login from './pages/Login';
import MatchDetailsPage from './pages/MatchDetailsPage';
import StartPage from './pages/StartPage';
import {Route, Routes, BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <WebSocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/start" element={<StartPage/>} />
          <Route path="/matches/:matchId" element={<MatchDetailsPage/>} />
        </Routes>
      </BrowserRouter>

    </WebSocketProvider>
  );
}

export default App;
