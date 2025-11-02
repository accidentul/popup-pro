import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ShopifyService } from '../shopify/shopify.service';
import { PopupsService } from '../popups/popups.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Controller('scripts')
export class ScriptsController {
  constructor(
    private readonly shopifyService: ShopifyService,
    private readonly popupsService: PopupsService,
    private readonly configService: ConfigService,
  ) {}

  @Get('popup.js')
  async getPopupScript(@Query('shopId') shopId: string, @Res() res: Response) {
    try {
      if (!shopId) {
        return res.status(400).send('// shopId parameter is required');
      }

      // Optional: Verify shop is installed (disabled for easier manual installation)
      // Uncomment for stricter security in production
      // const shop = await this.shopifyService.getShop(shopId);
      // if (!shop || !shop.isInstalled) {
      //   return res.status(404).send('// Shop not found or not installed');
      // }

      // Read the script template
      const scriptPath = path.join(process.cwd(), 'shopify-script', 'exit-intent-popup.js');
      
      if (!fs.existsSync(scriptPath)) {
        console.error('Script file not found at:', scriptPath);
        return res.status(500).send('// Script file not found');
      }

      let script = fs.readFileSync(scriptPath, 'utf-8');

      // Replace placeholders
      const apiBaseUrl = this.configService.get<string>('API_BASE_URL') || 
                        this.configService.get<string>('FRONTEND_URL')?.replace(':3000', ':3001') || 
                        'http://localhost:3001';
      
      script = script.replace(/{{API_BASE_URL}}/g, apiBaseUrl);
      script = script.replace(/{{SHOP_ID}}/g, shopId);

      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Access-Control-Allow-Origin', '*'); // Allow CORS for script loading
      return res.send(script);
    } catch (error) {
      console.error('Failed to serve script:', error);
      return res.status(500).send('// Error loading script');
    }
  }
}

