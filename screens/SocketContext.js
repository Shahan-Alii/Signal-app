import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';

const SocketContext = createContext();

export const useSocketContext = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { authUser, userId } = useContext(AuthContext);

    useEffect(() => {
        // console.log('hello world');
        if (authUser) {
            const socket = io('http://192.168.100.3:3000', {
                // Ensure this matches your server URL and port
                query: {
                    userId: userId,
                },
            });

            setSocket(socket);

            return () => socket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [userId]);

    return (
        <SocketContext.Provider value={{ socket, setSocket }}>
            {children}
        </SocketContext.Provider>
    );
};
