import { WebSocketProvider } from './WebSocketContext';
import Login from './pages/Login';

function App() {
  return (
    <WebSocketProvider>
    <div className="App">
      <Login />
    </div>
    </WebSocketProvider>
  );
}

export default App;
