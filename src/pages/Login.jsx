import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useWebSocket } from '../WebSocketContext';
import { jwtDecode } from 'jwt-decode';

const Login = () => {

  const [loginError, setLoginError] = useState(null);
  const websocket = useWebSocket();

  const handleGoogleLoginSuccess = (response) => {
    console.log('Logowanie Google zakończone sukcesem', response);
    const decodedToken = jwtDecode(response.credential);
    sendLoginRequest(decodedToken);
  };


  const handleGoogleLoginError = (response) => {
    console.log('Błąd logowania Google', response.profileObj.email);
    setLoginError(response.error);
  };

  const sendLoginRequest = (accessToken) => {
    const authData = {
      login: accessToken.email,
      password: ""
    }

    if (websocket){
      websocket.publish({
        destination: '/app/auth',
        body: JSON.stringify(authData),
      });

      websocket.subscribe('/topic/authRes', message => {
        const response = JSON.parse(message.body);
        console.log('Odpowiedź serwera po udanym logowaniu:', response);
      }); 
    } else {
        console.log("nie udało się stworzyć websocketa")
    }
     
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_CLIENT_ID}>
      <div className="container mx-auto max-w-sm p-4">
        <h1 className="text-2xl font-bold text-center mb-4">Logowanie</h1>

        <div className="flex justify-center mt-4">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
          />
        </div>
        {loginError && <div className="text-red-500 text-center mt-2">{loginError}</div>}
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;