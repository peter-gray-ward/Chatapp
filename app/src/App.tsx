import React from 'react';
import logo from './logo.svg';
import './App.scss';
import { xhr } from './util';
import { User, RequestOptions } from './types';

const initialState = {
  user: { } as User
};

function App() {
  return (
    <div className="App">
      <div className="Chats">
        <div className="Header">
          <h1>Chats</h1>
          <div className="Actions">
            <button>📽</button>
            <button>💬</button>
            <button>⋮</button>
          </div>
        </div>
        <div id="Chats-Search">
          <span>🔎</span>
          <input type="text" placeholder="Search" />
        </div>
      </div>
      <div className="Chat">
        <div className="Header">
          <div id="Chat-Room-Title">
            <button>&lt;</button>
            <h1>:Chat-room-title</h1>
          </div>
          <div className="Actions">
            <button>🔎</button>
            <button>📞</button>
            <button>≡</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
