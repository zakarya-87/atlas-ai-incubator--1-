import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
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
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket
  ): void {
    void client.join(room);
  }

  emitLog(room: string, log: Record<string, unknown>): void {
    this.server.to(room).emit('agentLog', log);
  }

  emitAnalysisResult(room: string, data: { jobId: string; result: Record<string, unknown> }): void {
    this.server.to(room).emit('analysisResult', data);
  }
}
