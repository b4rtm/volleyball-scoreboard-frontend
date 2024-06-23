import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useWebSocket } from '../WebSocketContext';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Login = () => {
  const DAYS_TO_COOKIE_EXPIRE = 1

  const [loginError, setLoginError] = useState(null);
  const { websocket, isConnected } = useWebSocket();
  const navigate = useNavigate()

  const handleGoogleLoginSuccess = (response) => {
    console.log('Logowanie Google zakończone sukcesem', response);
    sendLoginRequest(jwtDecode(response.credential));
    
    Cookies.set('userData', JSON.stringify({
      userToken: response.credential
    }), { expires: DAYS_TO_COOKIE_EXPIRE }); 

    navigate('/start')
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
        <h1 className="text-2xl font-bold text-center mb-4">Sign in</h1>

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