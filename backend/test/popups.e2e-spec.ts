import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PopupsModule } from '../src/popups/popups.module';
import { CacheModule } from '../src/cache/cache.module';
import { Popup, PopupStatus, PopupTriggerType } from '../src/popups/entities/popup.entity';
import { PopupView } from '../src/analytics/entities/popup-view.entity';
import { PopupConversion } from '../src/analytics/entities/popup-conversion.entity';

describe('PopupsController (e2e)', () => {
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
          entities: [Popup, PopupView, PopupConversion],
          synchronize: true,
          dropSchema: true, // Clean database for each test run
        }),
        CacheModule,
        PopupsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/popups (POST) - should create a popup', () => {
    const createDto = {
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

    return request(app.getHttpServer())
      .post('/popups')
      .send(createDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe(createDto.name);
        expect(res.body.status).toBe(PopupStatus.DRAFT);
      });
  });

  it('/popups (GET) - should return all popups for a shop', async () => {
    const createDto = {
      shopId: testShopId,
      name: 'Test Popup 2',
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

    await request(app.getHttpServer()).post('/popups').send(createDto);

    return request(app.getHttpServer())
      .get(`/popups?shopId=${testShopId}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('/popups/:id (GET) - should return a single popup', async () => {
    const createDto = {
      shopId: testShopId,
      name: 'Test Popup 3',
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

    const createRes = await request(app.getHttpServer())
      .post('/popups')
      .send(createDto);

    const popupId = createRes.body.id;

    return request(app.getHttpServer())
      .get(`/popups/${popupId}?shopId=${testShopId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(popupId);
        expect(res.body.name).toBe(createDto.name);
      });
  });

  it('/popups/:id (PATCH) - should update a popup', async () => {
    const createDto = {
      shopId: testShopId,
      name: 'Test Popup 4',
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

    const createRes = await request(app.getHttpServer())
      .post('/popups')
      .send(createDto);

    const popupId = createRes.body.id;

    return request(app.getHttpServer())
      .patch(`/popups/${popupId}?shopId=${testShopId}`)
      .send({ name: 'Updated Popup Name', status: PopupStatus.ACTIVE })
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('Updated Popup Name');
        expect(res.body.status).toBe(PopupStatus.ACTIVE);
      });
  });

  it('/popups/:id (DELETE) - should delete a popup', async () => {
    const createDto = {
      shopId: testShopId,
      name: 'Test Popup 5',
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

    const createRes = await request(app.getHttpServer())
      .post('/popups')
      .send(createDto);

    const popupId = createRes.body.id;

    return request(app.getHttpServer())
      .delete(`/popups/${popupId}?shopId=${testShopId}`)
      .expect(204);
  });
});

