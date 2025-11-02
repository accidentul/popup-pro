import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AnalyticsModule } from '../src/analytics/analytics.module';
import { PopupsModule } from '../src/popups/popups.module';
import { CacheModule } from '../src/cache/cache.module';
import { PopupView } from '../src/analytics/entities/popup-view.entity';
import { PopupConversion, ConversionType } from '../src/analytics/entities/popup-conversion.entity';
import { Popup, PopupTriggerType, PopupStatus } from '../src/popups/entities/popup.entity';

describe('AnalyticsController (e2e)', () => {
  let app: INestApplication;
  const testShopId = 'test-shop-123';
  let popupId: string;

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
          entities: [Popup, PopupView, PopupConversion],
          synchronize: true,
          dropSchema: true, // Clean database for each test run
        }),
        CacheModule,
        PopupsModule,
        AnalyticsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const createPopupDto = {
      shopId: testShopId,
      name: 'Test Popup',
      triggerType: PopupTriggerType.EXIT_INTENT,
      design: {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        heading: 'Special Offer!',
        subheading: 'Get 20% off',
        buttonText: 'Claim Offer',
        buttonColor: '#007bff',
        layout: 'centered',
        width: 500,
        borderRadius: 10,
        padding: 20,
      },
    };

    const popupRes = await request(app.getHttpServer())
      .post('/popups')
      .send(createPopupDto);

    popupId = popupRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/analytics/views (POST) - should track a popup view', () => {
    const trackViewDto = {
      popupId,
      sessionId: 'test-session-123',
      deviceType: 'desktop',
      pageUrl: 'https://example.com/page',
    };

    return request(app.getHttpServer())
      .post('/analytics/views')
      .send(trackViewDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.popupId).toBe(popupId);
      });
  });

  it('/analytics/conversions (POST) - should track a conversion', () => {
    const trackConversionDto = {
      popupId,
      type: ConversionType.EMAIL_CAPTURE,
      sessionId: 'test-session-123',
    };

    return request(app.getHttpServer())
      .post('/analytics/conversions')
      .send(trackConversionDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.type).toBe(ConversionType.EMAIL_CAPTURE);
      });
  });

  it('/analytics/popup/:popupId (GET) - should return popup stats', async () => {
    await request(app.getHttpServer())
      .post('/analytics/views')
      .send({ popupId, sessionId: 'session-1' });

    await request(app.getHttpServer())
      .post('/analytics/conversions')
      .send({ popupId, type: ConversionType.EMAIL_CAPTURE });

    return request(app.getHttpServer())
      .get(`/analytics/popup/${popupId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('views');
        expect(res.body).toHaveProperty('conversions');
        expect(res.body).toHaveProperty('conversionRate');
        expect(res.body.views).toBeGreaterThan(0);
      });
  });
});

