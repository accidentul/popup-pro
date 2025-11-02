import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { PopupsService } from './popups.service';
import { Popup, PopupStatus, PopupTriggerType } from './entities/popup.entity';

describe('PopupsService', () => {
  let service: PopupsService;
  let repository: Repository<Popup>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    increment: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PopupsService,
        {
          provide: getRepositoryToken(Popup),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<PopupsService>(PopupsService);
    repository = module.get<Repository<Popup>>(getRepositoryToken(Popup));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a popup', async () => {
      const createDto = {
        shopId: 'test-shop',
        name: 'Test Popup',
        triggerType: PopupTriggerType.EXIT_INTENT,
        design: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          heading: 'Test',
          subheading: 'Test sub',
          buttonText: 'Click',
          buttonColor: '#000',
          layout: 'centered' as const,
          width: 500,
          borderRadius: 10,
          padding: 20,
        },
      };

      const expectedPopup = {
        id: '1',
        ...createDto,
        status: PopupStatus.DRAFT,
        viewCount: 0,
        isActive: false,
      };

      mockRepository.create.mockReturnValue(expectedPopup);
      mockRepository.save.mockResolvedValue(expectedPopup);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(expectedPopup);
    });
  });

  describe('findAll', () => {
    it('should return all popups for a shop', async () => {
      const shopId = 'test-shop';
      const popups = [
        { id: '1', shopId, name: 'Popup 1' },
        { id: '2', shopId, name: 'Popup 2' },
      ];

      mockRepository.find.mockResolvedValue(popups);

      const result = await service.findAll(shopId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { shopId },
        order: { createdAt: 'DESC' },
        take: 100,
      });
      expect(result).toEqual(popups);
    });
  });
});

