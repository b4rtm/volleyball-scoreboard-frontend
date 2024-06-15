import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const UserInfoNav = () => {
    const navigate = useNavigate()

    const userCookie = Cookies.get('userData');
    console.log(userCookie)
    let user = null;
    if (userCookie) {
        try {
            user = JSON.parse(userCookie);
        } catch (error) {
            console.error('Błąd parsowania ciasteczka:', error);
        }
    }

    const handleLogout = () => {
        Cookies.remove('userData');
        navigate('/');
    }

    return (
        (user && <div className="container mx-auto p-4 w-full">
            <div className="flex justify-end">
                <div className="flex flex-col text-right">
                    <div className='flex justify-center'>
                        <img src={user.userToken.picture} alt="User Avatar" className="w-10 h-10 rounded-full mr-4" />
                        <p className="text-xl font-semibold">{user.userToken.email}</p>   
                    </div>
                    
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-2 py-1 rounded mt-4"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </div>)
        
    );
  };
  
export default UserInfoNav;