import React from 'react';
import AddMatch from '../components/AddMatch';
import UserInfoNav from '../components/UserInfoNav';
import MatchesList from '../components/MatchesList';

const StartPage = () => {
    return (
        <div>
            <UserInfoNav />
            <h1 className="text-2xl font-bold text-center mb-4">Start Page</h1>
            <AddMatch />
            <MatchesList />
        </div>
    );
};

export default StartPage;