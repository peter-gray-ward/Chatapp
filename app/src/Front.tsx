import './App.scss';
import React, { useEffect, useState } from 'react';
import App from './App';
import Login from './Login';
import { xhr } from './util';

export default function Front() {
    let [loading, setLoading] = useState(true);
    let [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        xhr({
            method: 'GET',
            url: '/get-user'
        }).then(res => {
            console.log("----", res);
            setLoading(false);
            if (res) {
                setAuthenticated(true);
            }
        });
    }, [])

    return (
        loading ? <div id="Front">
            <h1>Chatapp Front</h1>
        </div> : (
            authenticated ? <App /> : <Login />
        )
    );
}