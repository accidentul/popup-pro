import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ShopifyService } from './shopify.service';
import { ConfigService } from '@nestjs/config';

@Controller('shopify')
export class ShopifyController {
  constructor(
    private readonly shopifyService: ShopifyService,
    private readonly configService: ConfigService,
  ) {}

  @Get('install')
  async install(@Query('shop') shop: string, @Res() res: Response) {
    if (!shop) {
      return res.redirect(`${this.configService.get('FRONTEND_URL')}/install?error=no_shop`);
    }

    const installUrl = this.shopifyService.generateInstallUrl(shop);
    return res.redirect(installUrl);
  }

  @Get('auth/callback')
  async callback(
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    try {
      const shopEntity = await this.shopifyService.verifyOAuth(query);
      const shop = query.shop;

      // Try to install script tag (will be skipped in development)
      try {
        await this.shopifyService.installScriptTag(shop);
      } catch (scriptError) {
        console.error('Script tag installation error (non-fatal):', scriptError.message);
        // Don't fail the OAuth flow if script installation fails
        // The user can still use the app, just without the script tag
      }

      // Redirect to success page
      return res.redirect(
        `${this.configService.get('FRONTEND_URL')}/install/success?shop=${shop}`
      );
    } catch (error) {
      console.error('OAuth callback error:', error);
      const errorMessage = encodeURIComponent(error.message || 'Authentication failed');
      return res.redirect(
        `${this.configService.get('FRONTEND_URL')}/install?error=auth_failed&message=${errorMessage}`
      );
    }
  }

  @Get('status')
  async getStatus(@Query('shop') shop: string) {
    const shopEntity = await this.shopifyService.getShop(shop);
    return {
      installed: !!shopEntity?.isInstalled,
      scriptInstalled: !!shopEntity?.scriptInstalled,
      shop: shopEntity?.shopifyData,
    };
  }
}

