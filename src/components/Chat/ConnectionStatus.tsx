import React from 'react';

enum ConnectionStatus {
    CONNECTED = 'connected',
    CONNECTING = 'connecting',
    DISCONNECTED = 'disconnected'
}

interface ConnectionStatusProps {
    status: ConnectionStatus;
    onReconnect: () => void;
}

const ConnectionStatusComponent: React.FC<ConnectionStatusProps> = ({status, onReconnect}) => {
    return (
        <div className={`connection-status ${status}`}>
            <span className="icon">
                {status === ConnectionStatus.CONNECTED && '✓'}
                {status === ConnectionStatus.CONNECTING && '⟳'}
                {status === ConnectionStatus.DISCONNECTED && '✗'}
            </span>
            <span>
                {status === ConnectionStatus.CONNECTED && 'Połączono'}
                {status === ConnectionStatus.CONNECTING && 'Łączenie...'}
                {status === ConnectionStatus.DISCONNECTED && 'Rozłączono'}
            </span>
            {status === ConnectionStatus.DISCONNECTED && (
                <button className="reconnect-button" onClick={onReconnect}>
                    Połącz
                </button>
            )}
        </div>
    );
};

export {ConnectionStatusComponent, ConnectionStatus};