import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/revenue',
})
export class RevenueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('RevenueGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Client subscribes to shop updates
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, shopId: string) {
    client.join(`shop-${shopId}`);
    this.logger.log(`Client ${client.id} subscribed to shop ${shopId}`);
    return { event: 'subscribed', data: { shopId } };
  }

  /**
   * Client unsubscribes from shop updates
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, shopId: string) {
    client.leave(`shop-${shopId}`);
    this.logger.log(`Client ${client.id} unsubscribed from shop ${shopId}`);
    return { event: 'unsubscribed', data: { shopId } };
  }

  /**
   * Emit cart abandonment event to all clients watching a shop
   */
  emitCartAbandoned(shopId: string, data: any) {
    this.server.to(`shop-${shopId}`).emit('cart_abandoned', data);
    this.logger.log(`Emitted cart_abandoned to shop ${shopId}: $${data.value}`);
  }

  /**
   * Emit cart recovery event to all clients watching a shop
   */
  emitCartRecovered(shopId: string, data: any) {
    this.server.to(`shop-${shopId}`).emit('cart_recovered', data);
    this.logger.log(`Emitted cart_recovered to shop ${shopId}: $${data.value}`);
  }

  /**
   * Emit stats update to all clients watching a shop
   */
  emitStatsUpdate(shopId: string, stats: any) {
    this.server.to(`shop-${shopId}`).emit('stats_updated', stats);
    this.logger.log(`Emitted stats_updated to shop ${shopId}`);
  }
}
