import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { Shop } from './entities/shop.entity';

@Injectable()
export class ShopifyService {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly scopes: string = 'read_products,write_script_tags,read_orders';
  private readonly redirectUri: string;

  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('SHOPIFY_API_KEY') || '';
    this.apiSecret = this.configService.get<string>('SHOPIFY_API_SECRET') || '';
    this.redirectUri = `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/auth/callback`;
  }

  generateInstallUrl(shop: string): string {
    const nonce = crypto.randomBytes(16).toString('hex');
    const state = Buffer.from(JSON.stringify({ shop, nonce })).toString('base64');
    
    const params = new URLSearchParams({
      client_id: this.apiKey,
      scope: this.scopes,
      redirect_uri: this.redirectUri,
      state,
    });

    return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
  }

  async verifyOAuth(query: Record<string, string>): Promise<Shop> {
    const { shop, code, hmac } = query;

    if (!shop || !code || !hmac) {
      throw new UnauthorizedException('Missing required OAuth parameters');
    }

    // Verify HMAC
    if (!this.verifyHmac(query)) {
      throw new UnauthorizedException('Invalid HMAC');
    }

    // Exchange code for access token
    const accessToken = await this.exchangeCodeForToken(shop, code);

    // Get shop data
    const shopData = await this.getShopData(shop, accessToken);

    // Save or update shop
    let shopEntity = await this.shopRepository.findOne({ where: { shopId: shop } });
    
    if (!shopEntity) {
      shopEntity = this.shopRepository.create({
        shopId: shop,
        shopDomain: shop,
        accessToken,
        isInstalled: true,
        shopifyData: shopData,
        installedAt: new Date(),
      });
    } else {
      shopEntity.accessToken = accessToken;
      shopEntity.isInstalled = true;
      shopEntity.shopifyData = shopData;
      shopEntity.installedAt = new Date();
    }

    return this.shopRepository.save(shopEntity);
  }

  async installScriptTag(shopId: string): Promise<void> {
    const shop = await this.shopRepository.findOne({ where: { shopId } });
    if (!shop || !shop.accessToken) {
      throw new UnauthorizedException('Shop not authenticated');
    }

    const apiBaseUrl = this.configService.get<string>('API_BASE_URL') || 'http://localhost:3001';
    const scriptSrc = `${apiBaseUrl}/scripts/popup.js?shopId=${shopId}`;

    // In development mode, skip script tag installation since localhost URLs won't work with Shopify
    const isDevelopment = apiBaseUrl.includes('localhost') || apiBaseUrl.includes('127.0.0.1');

    if (isDevelopment) {
      console.warn('⚠️  Development mode detected - Skipping script tag installation.');
      console.warn('   Script tags require publicly accessible HTTPS URLs.');
      console.warn('   For production, set API_BASE_URL to your public domain (e.g., https://your-domain.com)');

      // Mark as installed anyway for development testing
      shop.scriptInstalled = false; // Keep as false to show warning
      shop.scriptUrl = scriptSrc;
      await this.shopRepository.save(shop);
      return;
    }

    // Validate that production URL is HTTPS
    if (!apiBaseUrl.startsWith('https://')) {
      throw new Error('API_BASE_URL must use HTTPS in production. Current value: ' + apiBaseUrl);
    }

    try {
      // Check if script tag already exists
      const response = await firstValueFrom(
        this.httpService.get(`https://${shop.shopDomain}/admin/api/2024-01/script_tags.json`, {
          headers: {
            'X-Shopify-Access-Token': shop.accessToken,
          },
          timeout: 10000,
        })
      );

      const existingScript = response.data.script_tags?.find(
        (tag: any) => tag.src === scriptSrc
      );

      if (!existingScript) {
        // Create script tag
        console.log(`Installing script tag for ${shopId}: ${scriptSrc}`);

        await firstValueFrom(
          this.httpService.post(
            `https://${shop.shopDomain}/admin/api/2024-01/script_tags.json`,
            {
              script_tag: {
                event: 'onload',
                src: scriptSrc,
              },
            },
            {
              headers: {
                'X-Shopify-Access-Token': shop.accessToken,
                'Content-Type': 'application/json',
              },
              timeout: 10000,
            }
          )
        );

        shop.scriptInstalled = true;
        shop.scriptUrl = scriptSrc;
        await this.shopRepository.save(shop);

        console.log(`✓ Script tag installed successfully for ${shopId}`);
      } else {
        console.log(`Script tag already exists for ${shopId}`);
        shop.scriptInstalled = true;
        shop.scriptUrl = scriptSrc;
        await this.shopRepository.save(shop);
      }
    } catch (error) {
      console.error('Failed to install script tag:', error);

      if (error.response?.data) {
        console.error('Shopify API Error:', JSON.stringify(error.response.data, null, 2));
      }

      throw new Error(`Script tag installation failed: ${error.message || 'Unknown error'}`);
    }
  }

  private verifyHmac(query: Record<string, string>): boolean {
    const { hmac, signature, ...rest } = query;

    const message = Object.keys(rest)
      .sort()
      .map((key) => `${key}=${rest[key]}`)
      .join('&');
    
    const hash = crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');

    return hash === hmac;
  }

  private async exchangeCodeForToken(shop: string, code: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`https://${shop}/admin/oauth/access_token`, {
          client_id: this.apiKey,
          client_secret: this.apiSecret,
          code,
        })
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Failed to exchange code for token:', error);
      throw new UnauthorizedException('Failed to authenticate with Shopify');
    }
  }

  private async getShopData(shop: string, accessToken: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://${shop}/admin/api/2024-01/shop.json`, {
          headers: {
            'X-Shopify-Access-Token': accessToken,
          },
        })
      );

      return response.data.shop;
    } catch (error) {
      console.error('Failed to get shop data:', error);
      return {};
    }
  }

  async getShop(shopId: string): Promise<Shop | null> {
    return this.shopRepository.findOne({ where: { shopId } });
  }
}

