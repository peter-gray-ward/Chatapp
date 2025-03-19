import React, { useCallback, useState, useRef } from 'react';
import { xhr } from './util';
import { User, UserLoginRequest, UserLoginResponse } from './types';
import './App.scss';

function Login({ setAuthenticated }: { setAuthenticated: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [tab, setTab] = useState('login');
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const changeTab = useCallback((tab: string) => {
    setTab(tab);
  }, []);
  const request = useCallback(() => {
    if (usernameRef.current && passwordRef.current) {
      const username = usernameRef.current.value;
      const password = passwordRef.current.value;
      if (username && password) {
        xhr({
          method: 'POST',
          url: `/${tab}-user`,
          body: { 
            UserName: username, 
            Password: password 
          } as UserLoginRequest
        }).then((res: UserLoginResponse) => {
          if (res) {
            console.log(tab + " successful", res);
            setAuthenticated(true);
          } else {
            console.error(tab + " failed", res);
          }
        })
      }
    }
  }, [usernameRef, passwordRef, tab]);
  return (
    <div id="Login">
      <h1>CHATAPP</h1>
      <div className="Tab-Container">
        <div className="Tabs">
          <button onClick={() => changeTab('login')} className={tab === 'login' ? 'active' : ''}>Login</button>
          <button onClick={() => changeTab('register')} className={tab === 'register' ? 'active' : ''}>Register</button>
        </div>
        <div className="Tab-Content">
          {
            tab == 'login' ? (<>
              <input type="text" placeholder="Username" ref={usernameRef} />
              <input type="password" placeholder="Password" ref={passwordRef} />
              <button onClick={request}>Login</button>
              </>) : (<>
              <input type="text" placeholder="Username" ref={usernameRef} />
              <input type="password" placeholder="Password" ref={passwordRef} />
              <button onClick={request}>Register</button>
            </>)
          }
        </div>
      </div>
    </div>
  );
}

export default Login;
