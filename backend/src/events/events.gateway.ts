import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

// Build the allowed origins list: always allow localhost dev, plus any
// production frontend URL provided via the FRONTEND_URL env variable.
const getAllowedOrigins = (): string[] => {
  const devOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ];
  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) {
    devOrigins.push(frontendUrl);
  }
  return devOrigins;
};

@WebSocketGateway({
  cors: {
    origin: getAllowedOrigins(),
    credentials: true,
  },
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 60000,
  maxHttpBufferSize: 1e8,
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket
  ): void {
    void client.join(room);
    this.logger.debug(`Client ${client.id} joined room: ${room}`);
  }

  emitLog(room: string, log: Record<string, unknown>): void {
    this.server.to(room).emit('agentLog', log);
  }

  emitAnalysisResult(room: string, data: { jobId: string; result: Record<string, unknown> }): void {
    this.server.to(room).emit('analysisResult', data);
  }
}
