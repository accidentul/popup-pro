import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DiscountCodesModule } from '../src/discount-codes/discount-codes.module';
import { CacheModule } from '../src/cache/cache.module';
import { DiscountCode, DiscountType } from '../src/discount-codes/entities/discount-code.entity';

describe('DiscountCodesController (e2e)', () => {
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
          entities: [DiscountCode],
          synchronize: true,
          dropSchema: true, // Clean database for each test run
        }),
        CacheModule,
        DiscountCodesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/discount-codes (POST) - should create a discount code', () => {
    const createDto = {
      shopId: testShopId,
      type: DiscountType.PERCENTAGE,
      value: 20,
    };

    return request(app.getHttpServer())
      .post('/discount-codes')
      .send(createDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('code');
        expect(res.body.type).toBe(DiscountType.PERCENTAGE);
        expect(res.body.value).toBe(20);
        expect(res.body.code).toMatch(/^POPUP-/);
      });
  });

  it('/discount-codes (GET) - should return all discount codes for a shop', async () => {
    const createDto = {
      shopId: testShopId,
      type: DiscountType.FIXED,
      value: 10,
    };

    await request(app.getHttpServer()).post('/discount-codes').send(createDto);

    return request(app.getHttpServer())
      .get(`/discount-codes?shopId=${testShopId}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('/discount-codes/code/:code (GET) - should find discount code by code', async () => {
    const createDto = {
      shopId: testShopId,
      code: 'TEST-CODE-123',
      type: DiscountType.PERCENTAGE,
      value: 15,
    };

    await request(app.getHttpServer()).post('/discount-codes').send(createDto);

    return request(app.getHttpServer())
      .get(`/discount-codes/code/TEST-CODE-123?shopId=${testShopId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.code).toBe('TEST-CODE-123');
        // PostgreSQL returns decimal as string, so parse it
        expect(parseFloat(res.body.value)).toBe(15);
      });
  });
});

