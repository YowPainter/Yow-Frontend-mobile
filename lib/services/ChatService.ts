import 'fast-text-encoding';
import { Client, IMessage } from '@stomp/stompjs';
import { useAuthStore } from '../../store/authStore';
import { OpenAPI } from '../core/OpenAPI';

export interface ChatMessage {
  id?: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
}

const getWsUrl = (baseUrl: string) => {
  let wsUrl = baseUrl;
  if (wsUrl.startsWith('https://')) {
    wsUrl = wsUrl.replace('https://', 'wss://');
  } else if (wsUrl.startsWith('http://')) {
    wsUrl = wsUrl.replace('http://', 'ws://');
  } else {
    wsUrl = 'wss://yowpainter-backend.onrender.com';
  }
  return `${wsUrl}/ws/websocket`;
};

class ChatService {
  private client: Client | null = null;
  private onMessageReceived: ((message: ChatMessage) => void) | null = null;

  public connect(onMessage: (message: ChatMessage) => void, onConnect?: () => void) {
    const token = useAuthStore.getState().token;
    if (!token) return;

    this.onMessageReceived = onMessage;

    const wsUrl = getWsUrl(OpenAPI.BASE);
    console.log('Connecting to Stomp WS at:', wsUrl);

    this.client = new Client({
      webSocketFactory: () => new WebSocket(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        console.log('STOMP DEBUG:', str);
      },
      onConnect: () => {
        console.log('STOMP Connected SUCCESS');
        if (onConnect) onConnect();
        this.client?.subscribe('/user/queue/messages', (message: IMessage) => {
          console.log('STOMP Received:', message.body);
          if (this.onMessageReceived) {
            this.onMessageReceived(JSON.parse(message.body));
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message']);
        console.error('STOMP Full Frame:', frame);
      },
      onWebSocketClose: (evt) => {
        console.log('STOMP WebSocket Closed:', evt);
      },
      onDisconnect: () => {
        console.log('STOMP Disconnected');
      }
    });

    this.client.activate();
  }

  public disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  public sendMessage(recipientId: string, content: string) {
    if (this.client && this.client.connected) {
      const senderId = useAuthStore.getState().user?.id;
      if (!senderId) return null;

      const message: ChatMessage = {
        senderId,
        recipientId,
        content,
        timestamp: new Date().toISOString()
      };

      this.client.publish({
        destination: '/app/chat',
        body: JSON.stringify(message)
      });

      return message;
    }
    return null;
  }
}

export const chatService = new ChatService();
