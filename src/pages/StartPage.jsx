import React from 'react';
import AddMatch from '../components/AddMatch';
import UserInfoNav from '../components/UserInfoNav';

const StartPage = () => {
    return (
        <div>
            <UserInfoNav />
            <h1 className="text-2xl font-bold text-center mb-4">Start Page</h1>
            <AddMatch />
        </div>
    );
};

export default StartPage;