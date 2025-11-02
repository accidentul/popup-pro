import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ABTestingService } from './ab-testing.service';
import { CreateABTestGroupDto } from './dto/create-ab-test-group.dto';

@Controller('ab-testing')
export class ABTestingController {
  constructor(private readonly abTestingService: ABTestingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateABTestGroupDto) {
    return this.abTestingService.create(createDto);
  }

  @Get()
  findAll(@Query('shopId') shopId: string) {
    if (!shopId) {
      throw new Error('shopId is required');
    }
    return this.abTestingService.findAll(shopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('shopId') shopId: string) {
    if (!shopId) {
      throw new Error('shopId is required');
    }
    return this.abTestingService.findOne(id, shopId);
  }

  @Get(':id/results')
  getTestResults(@Param('id') id: string, @Query('shopId') shopId: string) {
    if (!shopId) {
      throw new Error('shopId is required');
    }
    return this.abTestingService.getTestResults(id, shopId);
  }

  @Post(':id/winner')
  selectWinner(
    @Param('id') id: string,
    @Query('shopId') shopId: string,
    @Body('popupId') popupId: string,
  ) {
    if (!shopId) {
      throw new Error('shopId is required');
    }
    return this.abTestingService.selectWinner(id, shopId, popupId);
  }
}


