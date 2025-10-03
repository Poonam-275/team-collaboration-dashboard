import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WebSocketAuthGuard } from '../common/guards/websocket-auth.guard';
import { UsersService } from '../users/users.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('WebSocketGateway');
  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        client.disconnect();
        return;
      }

      this.connectedUsers.set(client.id, user.id);
      client.data.user = user;

      // Notify others about user coming online
      client.broadcast.emit('userOnline', { userId: user.id });
      this.logger.log(`User ${user.email} connected`);

    } catch (error) {
      this.logger.error('WebSocket connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      this.connectedUsers.delete(client.id);
      client.broadcast.emit('userOffline', { userId: user.id });
      this.logger.log(`User ${user.email} disconnected`);
    }
  }

  @UseGuards(WebSocketAuthGuard)
  @SubscribeMessage('joinTaskRoom')
  handleJoinTaskRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { taskId: string },
  ) {
    client.join(`task:${data.taskId}`);
  }

  @UseGuards(WebSocketAuthGuard)
  @SubscribeMessage('leaveTaskRoom')
  handleLeaveTaskRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { taskId: string },
  ) {
    client.leave(`task:${data.taskId}`);
  }

  @UseGuards(WebSocketAuthGuard)
  @SubscribeMessage('joinChannel')
  handleJoinChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channel: string },
  ) {
    client.join(`channel:${data.channel}`);
  }

  @UseGuards(WebSocketAuthGuard)
  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channel: string },
  ) {
    client.leave(`channel:${data.channel}`);
  }

  // Notify task updates to room
  notifyTaskUpdate(taskId: string, update: any) {
    this.server.to(`task:${taskId}`).emit('taskUpdated', update);
  }

  // Notify new message to channel
  notifyNewMessage(channel: string, message: any) {
    this.server.to(`channel:${channel}`).emit('newMessage', message);
  }

  // Notify user about activity
  notifyUserActivity(userId: string, activity: any) {
    this.server.emit('userActivity', { userId, activity });
  }
}
