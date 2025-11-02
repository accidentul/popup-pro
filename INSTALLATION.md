# ExitIntent Pro - Installation Guide

This guide will help you integrate ExitIntent Pro with your Shopify store seamlessly.

## Two Installation Methods

### Method 1: OAuth Installation (Recommended) ⭐

The easiest and most secure way to install ExitIntent Pro.

#### Prerequisites
- A Shopify store (development or production)
- ExitIntent Pro backend running and accessible
- Shopify API credentials configured

#### Steps

1. **Configure Environment Variables**
   
   Add to your backend `.env`:
   ```env
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   FRONTEND_URL=http://localhost:3000
   API_BASE_URL=http://localhost:3001
   ```

2. **Create a Shopify App**
   - Go to [Shopify Partners Dashboard](https://partners.shopify.com)
   - Create a new app
   - Set App URL: `http://localhost:3000`
   - Set Allowed redirection URL(s): `http://localhost:3000/auth/callback`
   - Copy your API Key and Secret

3. **Install via OAuth**
   - Navigate to `/install` in your frontend
   - Enter your store domain (e.g., `your-store.myshopify.com`)
   - Click "Install ExitIntent Pro"
   - Authorize the app in Shopify
   - The script will be automatically installed!

#### Benefits
- ✅ Automatic script installation
- ✅ Secure OAuth authentication
- ✅ No manual code editing required
- ✅ Works with Shopify App Bridge (future)

---

### Method 2: Manual Installation

For custom integrations or when OAuth is not available.

#### Steps

1. **Get Your Shop ID**
   - Navigate to `/settings` in the app
   - Enter your Shopify store domain or shop ID
   - Save settings

2. **Get the Script Tag**
   - Navigate to `/install/manual?shopId=your-shop-id`
   - Copy the generated script tag

3. **Add to Shopify Theme**
   - Go to Shopify Admin → Online Store → Themes
   - Click "Actions" → "Edit code"
   - Open `theme.liquid` in the Layout folder
   - Paste the script tag just before `</head>`
   - Save changes

#### Script Tag Format
```html
<script src="http://your-api-url/scripts/popup.js?shopId=your-shop-id" async></script>
```

---

## Post-Installation

### Verify Installation

1. **Check Script is Loading**
   - Open your storefront
   - Open browser DevTools (F12)
   - Check Network tab for `popup.js` request
   - Should return status 200

2. **Test Exit-Intent**
   - Visit your store
   - Move mouse cursor towards browser top (exit-intent)
   - Popup should appear (if you have active popups)

3. **Check Dashboard**
   - Navigate to `/popups` in the app
   - Create your first popup
   - Set status to "Active"
   - The popup should now appear on your store

---

## Troubleshooting

### Script Not Loading

**Problem**: Script returns 404 or doesn't load

**Solutions**:
- Verify `API_BASE_URL` is correct and accessible
- Check `shopId` matches your store domain
- Ensure backend `/scripts/popup.js` endpoint is working
- Check CORS settings if accessing from different domain

### Popups Not Appearing

**Problem**: Script loads but popups don't show

**Solutions**:
- Verify popup status is "Active" in dashboard
- Check browser console for JavaScript errors
- Ensure popup has valid design configuration
- Verify shopId matches in script URL and popup records

### OAuth Installation Fails

**Problem**: OAuth redirect fails or shows error

**Solutions**:
- Verify `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` are correct
- Check redirect URL matches Shopify app settings exactly
- Ensure `FRONTEND_URL` environment variable is set correctly
- Check backend logs for detailed error messages

---

## Environment Variables Reference

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/exit_intent_popup

# Server
PORT=3001
NODE_ENV=development

# Shopify OAuth
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret

# URLs
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:3001

# Database Pool (optional)
DB_POOL_MAX=20
DB_POOL_MIN=5
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

---

## Next Steps

1. **Create Your First Popup**
   - Go to `/popups/new`
   - Design your popup
   - Set it to "Active"
   - Test on your storefront

2. **Set Up Analytics**
   - View performance at `/analytics`
   - Track conversions and views
   - Optimize based on data

3. **Explore Features**
   - A/B Testing at `/ab-testing`
   - Email subscribers management
   - Discount code generation

---

## Support

For issues or questions:
- Check the backend logs: `docker-compose logs backend`
- Check the frontend logs: `docker-compose logs frontend`
- Review browser console for client-side errors
- Ensure all environment variables are set correctly

---

## Security Notes

- Never commit `.env` files to version control
- Use HTTPS in production
- Keep Shopify API credentials secure
- Regularly rotate access tokens
- Monitor script installation status

---

## Production Deployment

When deploying to production:

1. **Update URLs**
   - Set `FRONTEND_URL` to your production domain
   - Set `API_BASE_URL` to your production API domain
   - Update Shopify app settings with production URLs

2. **Enable HTTPS**
   - Shopify requires HTTPS for production apps
   - Use SSL certificates (Let's Encrypt recommended)

3. **Configure CORS**
   - Allow only your Shopify store domains
   - Restrict API access appropriately

4. **Set Environment Variables**
   - Use secure secret management
   - Never expose API keys in client-side code

---

Happy popup building! 🎉


