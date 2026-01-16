
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for development
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 60000,
  maxHttpBufferSize: 1e8,
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
    client.join(room);
  }

  emitLog(room: string, log: any) {
    this.server.to(room).emit('agentLog', log);
  }
}