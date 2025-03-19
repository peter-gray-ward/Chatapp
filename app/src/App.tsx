import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import './App.scss';
import { User, ChatModalItems, Room, Post } from './types';
import Modal from './Modal';
import { xhr, capitalizeKeys } from './util';
import * as signalR from '@microsoft/signalr';
import { error } from 'console';

const initialState = {
  user: {} as User
};

function App({ user }: { user: User }) {
  const [viewModal, setViewModal] = useState({
    chats: false,
    chat: false
  });
  const [pagePositions, setPagePositions] = useState({
    chatsModalOrigin: { top: 0, left: 0 }
  });
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [loggedInUsers, setLoggedInUsers] = useState<User[]>([]);
  const [room, setRoom] = useState<Room|null>(null);
  const chatsModalOrigin = useRef<HTMLButtonElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);

  const loadUsers = useCallback(() => {
    xhr({
      url: '/get-logged-in-users',
      method: 'GET'
    }).then((users: User[]) => {
      if (users) {
        for (let user of users) {
          for (let key in user) {
            let val = user[key];
            let newKey = key.charAt(0).toUpperCase() + key.slice(1);
            delete user[key];
            user[newKey] = val;
          }
        }
        setLoggedInUsers(users);
      }
    });
  }, []);

  const goToChat = useCallback((u: User) => {
    let userIds = user.Id + '|' + u.Id;
    xhr({
      url: `/go-to-chatroom?userIds=${userIds}`,
      method: 'GET'
    }).then((room: Room) => {
      console.log("room:", room);
      setRoom(room);
      if (connection) {
        connection.invoke('JoinRoom', room.Id);
      }
    });
  }, [user, connection]);

  const roomName = useMemo(() => {
    if (room) {
      let userIds = room.UserIds.split('|');
      return loggedInUsers.filter((u: User) => userIds.includes(u.Id)).map((u: User) => u.UserName).join(', ');
    } else {
      return 'Empty Chat Room';
    }
  }, [room]);

  const chat = useCallback((event: any) => {
    if (chatInputRef.current && event.key.toUpperCase() == 'ENTER') {
      const message = chatInputRef.current.value;
      if (connection && message.trim() !== '') {
        connection.send('SendMessage', room!.Id, message)
          .then(() => {
            chatInputRef.current!.value = '';
          })
          .catch(error => console.error("Error sending message: ", error));
      }
    }
  }, [chatInputRef, room]);

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

    //console.log("SignalR connection created", newConnection);

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          //console.log('Connected to SignalR hub');

          connection.on('ReceiveMessage', (user, post: Post) => {
            post = capitalizeKeys(post);
            console.log("new message", post);
            setRoom(prevRoom => {
              if (!prevRoom) return prevRoom;
              return {
                ...prevRoom,
                Posts: [
                  ...prevRoom.Posts,
                  post
                ]
              } as Room;
            });
          });

          connection.on('UserConnected', (user: User) => {
            loadUsers();
          });

          connection.on('UserDisconnected', (user: User) => {
            loadUsers();
          });

          loadUsers();
        })
        .catch(error => console.error('Connection failed: ', error));

      // Handle disconnection when the browser window or tab is closed
      const handleBeforeUnload = () => {
        connection.stop().then(() => console.log('Disconnected from SignalR hub'));
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      // Clean up the event listener on component unmount
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        connection.stop().then(() => console.log('Disconnected from SignalR hub'));
      };
    }
  }, [connection, loadUsers]);

  console.log(new Date().getTime());

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
          {
            loggedInUsers.filter((u: User) => u.Id !== user.Id).map((u: User, index: number) => (
              <div key={index} className="Chats-User" onClick={() => goToChat(u)}>
                <img src={u.ProfileThumbnailBase64 || '/favicon.ico'} alt={`${u.UserName}'s profile`} />
                <div>{u.UserName}</div>
              </div>
            ))
          }
        </div>
        {
          chatsModalOrigin.current && viewModal.chats ? <Modal items={ChatModalItems} origin={chatsModalOrigin} originPosition={pagePositions.chatsModalOrigin} /> : null
        }
      </div>
      <div className="Chat">
        <div className="Header">
          <div id="Chat-Room-Title">
            <button>&lt;</button>
            <h1>{roomName}</h1>
          </div>
          <div className="Actions">
            <button>🔎</button>
            <button>📞</button>
            <button>≡</button>
          </div>
        </div>
        <div id="Chat-Content">
          {
            room?.Posts.map((post: Post, index: number) => {
              return <div key={index} className={`Post${post.UserId == user.Id ? ' Self' : ''}`}>
                {
                  post.Text
                }
              </div>
            })
          }
        </div>
        <div id="Chat-Input">
          <input type="text" placeholder="Type a message..." ref={chatInputRef} onKeyDown={chat}/>
          <button>➤</button> 
        </div>
      </div>
    </div>
  );
}

export default App;
