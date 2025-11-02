import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PopupsService } from './popups.service';
import { CreatePopupDto } from './dto/create-popup.dto';
import { UpdatePopupDto } from './dto/update-popup.dto';

@Controller('popups')
export class PopupsController {
  constructor(private readonly popupsService: PopupsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPopupDto: CreatePopupDto) {
    return this.popupsService.create(createPopupDto);
  }

  @Get()
  findAll(@Query('shopId') shopId: string) {
    if (!shopId) {
      throw new Error('shopId is required');
    }
    return this.popupsService.findAll(shopId);
  }

  @Get('active')
  getActivePopups(@Query('shopId') shopId: string) {
    if (!shopId) {
      throw new Error('shopId is required');
    }
    return this.popupsService.getActivePopups(shopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('shopId') shopId: string) {
    if (!shopId) {
      throw new Error('shopId is required');
    }
    return this.popupsService.findOne(id, shopId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('shopId') shopId: string,
    @Body() updatePopupDto: UpdatePopupDto,
  ) {
    if (!shopId) {
      throw new Error('shopId is required');
    }
    return this.popupsService.update(id, shopId, updatePopupDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Query('shopId') shopId: string) {
    if (!shopId) {
      throw new Error('shopId is required');
    }
    return this.popupsService.remove(id, shopId);
  }
}


