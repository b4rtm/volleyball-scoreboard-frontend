import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const Login = () => {

  const handleGoogleLoginSuccess = (response) => {
    console.log('Logowanie Google zakończone sukcesem', response);
  };

  const handleGoogleLoginError = (response) => {
    console.log('Błąd logowania Google', response);
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
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;