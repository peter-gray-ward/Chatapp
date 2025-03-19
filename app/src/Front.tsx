import './App.scss';
import React, { useCallback, useEffect, useState } from 'react';
import App from './App';
import Login from './Login';
import { User } from './types';
import { xhr } from './util';

export default function Front() {
    let [loading, setLoading] = useState(true);
    let [user, setUser] = useState<User|null>(null);
    let [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        xhr({
            method: 'GET',
            url: '/get-user'
        }).then(res => {
            console.log("----", res);
            setLoading(false);
            if (res) {
                for (let key in res) {
                    let val = res[key];
                    let newKey = key.charAt(0).toUpperCase() + key.slice(1);
                    delete res[key];
                    res[newKey] = val;
                }
                setUser(res);
                setAuthenticated(true);
            }
        });
    }, [])

    return (
        loading ? <div id="Front">
            <h1>Chatapp Front</h1>
        </div> : (
            user ? <App user={user!} /> : <Login setUser={setUser} />
        )
    );
}