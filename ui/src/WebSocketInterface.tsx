import React, { useState, useRef, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import 'bootstrap/dist/css/bootstrap.min.css';

const WebSocketInterface: React.FC = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Disconnected');
  const [message, setMessage] = useState<string>('');
  const [responses, setResponses] = useState<string[]>([]);
  const client = useRef<Client | null>(null);

  useEffect(() => {
    return () => {
      if (client.current) {
        client.current.deactivate();
      }
    };
  }, []);

  const connect = () => {
    const socket = new SockJS('http://localhost:8080/app-endpoint');
    client.current = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setConnected(true);
        setStatus('Connected');
        if (client.current) {
          client.current.subscribe('/topic/response', (message) => {
            const data = JSON.parse(message.body);
            setResponses((prev) => [...prev, data.value]);
          });
        }
      },
      onDisconnect: () => {
        setConnected(false);
        setStatus('Disconnected');
      },
      onStompError: (frame) => {
        setConnected(false);
        setStatus(`Error: ${frame.headers['message']}`);
      },
    });

    client.current.activate();
  };

  const disconnect = () => {
    client.current?.deactivate();
    setConnected(false);
    setStatus('Disconnected');
  };

  const sendMessage = () => {
    if (connected && client.current) {
      client.current.publish({ destination: '/app/request', body: JSON.stringify({ value: message }) });
      setMessage('');
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow rounded">
        <div className="card-body text-center">
          <h3 className="mb-4">WebSocket Interface</h3>
          <div className="mb-3 d-flex justify-content-center gap-2">
            <button className="btn btn-success" onClick={connect} disabled={connected}>
              Connect
            </button>
            <button className="btn btn-danger" onClick={disconnect} disabled={!connected}>
              Disconnect
            </button>
            <span
              className={`btn ${
                status === 'Connected'
                  ? 'btn-success'
                  : status === 'Error'
                  ? 'btn-warning'
                  : 'btn-secondary'
              }`}
              style={{ cursor: 'default' }}
            >
              <strong>{status}</strong>
            </span>
          </div>
          <div className="d-flex justify-content-center">
            <input
              type="text"
              className="form-control w-50 me-2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!connected}
              placeholder="Enter message"
            />
            <button
              className="btn btn-primary"
              onClick={sendMessage}
              disabled={!connected || message.trim() === ''}
            >
              Send
            </button>
          </div>
          {/* Table to display responses */}
          <div className="mt-4">
            <h5>Responses:</h5>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Response</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((response, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{response}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSocketInterface;
