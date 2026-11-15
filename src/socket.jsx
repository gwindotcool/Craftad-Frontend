
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSession } from "./session";

const SocketContext = createContext(null);

const SOCKET_URL = "https://craftad-lite-2.onrender.com";

export function SocketProvider({ children }) {
    const { token } = useSession();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!token) {
            setSocket(null);
            return;
        }

        const socketInstance = io(SOCKET_URL, {
            auth: {
                token
            },
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();

            setSocket((currentSocket) =>
                currentSocket === socketInstance ? null : currentSocket
            );
        };
    }, [token]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
