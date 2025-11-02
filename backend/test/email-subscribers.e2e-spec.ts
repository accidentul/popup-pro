import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EmailSubscribersModule } from '../src/email-subscribers/email-subscribers.module';
import { CacheModule } from '../src/cache/cache.module';
import { EmailSubscriber } from '../src/email-subscribers/entities/email-subscriber.entity';

describe('EmailSubscribersController (e2e)', () => {
  let app: INestApplication;
  const testShopId = 'test-shop-123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'exit_intent_popup_test',
          entities: [EmailSubscriber],
          synchronize: true,
          dropSchema: true, // Clean database for each test run
        }),
        CacheModule,
        EmailSubscribersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/email-subscribers (POST) - should create an email subscriber', () => {
    const createDto = {
      shopId: testShopId,
      email: 'test@example.com',
      name: 'Test User',
    };

    return request(app.getHttpServer())
      .post('/email-subscribers')
      .send(createDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toBe(createDto.email);
        expect(res.body.isActive).toBe(true);
      });
  });

  it('/email-subscribers (POST) - should handle duplicate email gracefully', async () => {
    const createDto = {
      shopId: testShopId,
      email: 'duplicate@example.com',
    };

    await request(app.getHttpServer()).post('/email-subscribers').send(createDto);

    return request(app.getHttpServer())
      .post('/email-subscribers')
      .send(createDto)
      .expect(409);
  });

  it('/email-subscribers (GET) - should return all subscribers for a shop', async () => {
    const createDto = {
      shopId: testShopId,
      email: 'another@example.com',
    };

    await request(app.getHttpServer()).post('/email-subscribers').send(createDto);

    return request(app.getHttpServer())
      .get(`/email-subscribers?shopId=${testShopId}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/email-subscribers/count (GET) - should return subscriber count', async () => {
    return request(app.getHttpServer())
      .get(`/email-subscribers/count?shopId=${testShopId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('count');
        expect(typeof res.body.count).toBe('number');
        expect(res.body.count).toBeGreaterThanOrEqual(0);
      });
  });
});

