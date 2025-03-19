import React, { useRef, useState, useEffect } from 'react';
import './App.scss';
import { User, ChatModalItems } from './types';
import Modal from './Modal';
import * as signalR from '@microsoft/signalr'

const initialState = {
  user: { } as User
};

function App() {
  const [viewModal, setViewModal] = useState({
    chats: false,
    chat: false
  });
  const [pagePositions, setPagePositions] = useState({
    chatsModalOrigin: { top: 0, left: 0 }
  });
  const [connection, setConnection] = useState<signalR.HubConnection|null>(null);
  const chatsModalOrigin = useRef<HTMLButtonElement|null>(null);

  const handleResize = () => {
    setPagePositions({
      chatsModalOrigin: {
        top: chatsModalOrigin.current ? chatsModalOrigin.current.getBoundingClientRect().top : 0,
        left: chatsModalOrigin.current ? chatsModalOrigin.current.getBoundingClientRect().left : 0
      }
    });
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    // clean up the event on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5156/chatapp-hub")
      .withAutomaticReconnect()
      .build();

    console.log("SignalR connection created", newConnection);

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log('Connected to SignalR hub');

          connection.on('ReceiveMessage', (user, message) => {
            console.log(`Message from ${user}: ${message}`);
          });
        })
        .catch(error => console.error('Connection failed: ', error));
    }
  }, [connection]);

  return (
    <div className="App">
      <div className="Chats">
        <div className="Header">
          <h1>Chats</h1>
          <div className="Actions">
            <button>📽</button>
            <button>💬</button>
            <button ref={chatsModalOrigin} onClick={() => setViewModal({ ...viewModal, chats: !viewModal.chats })}>⋮</button>
          </div>
        </div>
        <div id="Chats-Search">
          <span>🔎</span>
          <input type="text" placeholder="Search" />
        </div>
        <div id="Chats-List">
        </div>
        {
          chatsModalOrigin.current && viewModal.chats ? <Modal items={ChatModalItems} origin={chatsModalOrigin} originPosition={pagePositions.chatsModalOrigin} /> : null
        }
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
