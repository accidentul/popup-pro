# How to Sell Your ExitIntent Pro App on Shopify App Store

This guide explains how to make your app available for purchase on the Shopify App Store.

## Overview

When users install your app through the Shopify App Store, Shopify handles:
- **Discovery**: Users find your app in the Shopify App Store
- **Installation**: One-click install through Shopify
- **Billing**: Automatic recurring charges through Shopify Billing API
- **Management**: Users manage subscriptions in their Shopify admin

## Prerequisites

1. **Shopify Partner Account**
   - Sign up at [partners.shopify.com](https://partners.shopify.com)
   - Complete partner verification

2. **App Created in Partner Dashboard**
   - Your app must be listed in the Shopify App Store
   - App must be reviewed and approved by Shopify

3. **Production Environment**
   - App deployed and accessible via HTTPS
   - All environment variables configured
   - Database and infrastructure ready

## Step-by-Step: Submitting Your App

### 1. Create Your App in Partner Dashboard

1. Go to [Partners Dashboard](https://partners.shopify.com)
2. Click **Apps** → **Create app**
3. Choose **Public app** (for App Store listing)
4. Fill in app details:
   - **App name**: ExitIntent Pro
   - **App URL**: `https://your-domain.com` (your frontend URL)
   - **Allowed redirection URL(s)**: `https://your-domain.com/auth/callback`

### 2. Configure App Settings

**App Setup:**
- **Embedded app**: Yes (recommended for better UX)
- **App Bridge**: Enabled (for embedded experience)
- **Admin API scopes**: 
  - `read_products`
  - `write_script_tags`
  - `read_orders`
  - `write_customers`

**Distribution:**
- Select **Shopify App Store**
- Choose relevant categories:
  - Marketing
  - Conversion optimization
  - Email marketing

### 3. Set Up Billing

Your app uses **Recurring Application Charges**:

```typescript
// Example: Creating a charge (already implemented in subscriptions.service.ts)
POST /admin/api/2024-01/recurring_application_charges.json
{
  "recurring_application_charge": {
    "name": "ExitIntent Pro - Professional Plan",
    "price": 25.00,
    "return_url": "https://your-domain.com/billing/callback",
    "test": false  // Set to true for development
  }
}
```

**Billing Configuration:**
- All charges must be approved by merchant
- Charges are monthly recurring
- Automatic renewal unless cancelled
- Shopify handles all payment processing

### 4. App Store Listing

**Required Information:**

1. **App Name**: ExitIntent Pro
2. **Tagline**: "Turn abandoning visitors into customers with exit-intent popups"
3. **Description**: 
   ```
   ExitIntent Pro helps Shopify merchants recover lost sales by detecting 
   when visitors are about to leave and displaying targeted popups with 
   discounts, email capture forms, or special offers.
   
   Features:
   - Exit-intent detection for desktop
   - Mobile-specific popup triggers
   - Drag-and-drop popup builder
   - Discount code generation
   - Email list integration
   - A/B testing
   - Advanced analytics
   ```

4. **Pricing Tiers**:
   - Free: 1 popup, 100 views/month
   - Starter: $12/month - 3 popups, 5,000 views/month
   - Professional: $25/month - Unlimited popups & views
   - Enterprise: $49/month - All features + priority support

5. **Screenshots**: 
   - Dashboard screenshot
   - Popup builder interface
   - Analytics dashboard
   - Example popup on storefront

6. **Support Email**: Your support email address

### 5. Testing Your App

Before submitting for review:

1. **Test Installation Flow**:
   - Install app on development store
   - Verify OAuth flow works
   - Check script installation

2. **Test Billing**:
   - Create test charges (use `test: true`)
   - Verify charge activation
   - Test subscription upgrades/downgrades

3. **Test Functionality**:
   - Create popups
   - Verify exit-intent detection
   - Test all features work correctly

### 6. Submit for Review

1. Complete all required fields in Partner Dashboard
2. Upload screenshots and app icon
3. Submit for review
4. Shopify typically reviews within 7-14 business days

**Review Criteria:**
- App works as described
- Billing is transparent and fair
- No security vulnerabilities
- Follows Shopify app best practices
- Good user experience

## How Users Purchase Your App

### Installation Flow

1. **Discovery**:
   - Merchant searches Shopify App Store
   - Finds "ExitIntent Pro"
   - Reads description and reviews

2. **Installation**:
   - Clicks "Add app"
   - Authorizes app permissions
   - Redirected to your app

3. **Trial Period** (Optional):
   - You can offer a free trial
   - Set `trialEndsAt` in subscription
   - Merchant can try before paying

4. **Upgrade to Paid Plan**:
   - Merchant uses app (free plan)
   - Decides to upgrade
   - Clicks "Upgrade" in your app
   - Redirected to Shopify billing page
   - Approves recurring charge
   - Returns to your app (now on paid plan)

### Billing Flow (Already Implemented)

Your app already handles billing through:

1. **Upgrade Request** (`POST /subscriptions/upgrade`):
   - Creates Shopify recurring charge
   - Returns confirmation URL

2. **Charge Activation** (`POST /subscriptions/activate`):
   - Called when merchant approves charge
   - Updates subscription status
   - Enables plan features

3. **Usage Tracking**:
   - Monitors popup views/conversions
   - Enforces plan limits
   - Shows usage in dashboard

## Environment Variables for Production

```env
# Shopify OAuth
SHOPIFY_API_KEY=your_production_api_key
SHOPIFY_API_SECRET=your_production_api_secret

# URLs
FRONTEND_URL=https://your-domain.com
API_BASE_URL=https://api.your-domain.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Security
NODE_ENV=production
JWT_SECRET=your_secure_secret_key
```

## Monetization Strategy

### Pricing Tiers

1. **Free Plan** ($0/month)
   - 1 popup
   - 100 views/month
   - Basic features
   - **Purpose**: Acquire users, show value

2. **Starter Plan** ($12/month)
   - 3 popups
   - 5,000 views/month
   - All basic features
   - **Target**: Small stores starting out

3. **Professional Plan** ($25/month)
   - Unlimited popups
   - Unlimited views
   - Advanced analytics
   - **Target**: Growing stores with traffic

4. **Enterprise Plan** ($49/month)
   - Everything in Professional
   - A/B testing
   - Priority support
   - API access
   - **Target**: High-volume stores

### Revenue Optimization

- **Freemium Model**: Free plan attracts users, upgrades drive revenue
- **Usage-Based**: View limits encourage upgrades as stores grow
- **Feature Gating**: Premium features (A/B testing, API) in higher tiers
- **Clear Value Prop**: Each tier solves specific merchant needs

## Legal & Compliance

1. **Privacy Policy**: Required for App Store
2. **Terms of Service**: Define usage rights
3. **Data Handling**: Comply with GDPR, CCPA
4. **Refund Policy**: Define cancellation/refund terms

## Marketing Your App

1. **App Store Optimization**:
   - Keyword-rich description
   - Clear value proposition
   - Social proof (reviews, ratings)

2. **Content Marketing**:
   - Blog posts about cart abandonment
   - Case studies from users
   - Video tutorials

3. **Partnerships**:
   - Collaborate with Shopify experts
   - Sponsor Shopify events
   - Partner with agencies

## Support & Maintenance

1. **Customer Support**:
   - Email support for all plans
   - Priority support for Enterprise
   - Documentation and tutorials

2. **Regular Updates**:
   - New features
   - Bug fixes
   - Performance improvements

3. **Monitoring**:
   - Track app performance
   - Monitor user feedback
   - Iterate based on data

## Next Steps

1. ✅ Complete app development (you're here!)
2. ⏳ Deploy to production
3. ⏳ Create Partner account and app listing
4. ⏳ Test thoroughly on development store
5. ⏳ Submit for Shopify review
6. ⏳ Launch and start acquiring users!

## Resources

- [Shopify Partners Documentation](https://shopify.dev/docs/apps)
- [Billing API Guide](https://shopify.dev/docs/apps/billing)
- [App Store Guidelines](https://shopify.dev/docs/apps/store/requirements)
- [App Review Process](https://shopify.dev/docs/apps/store/review)

---

**Note**: This implementation already includes all the billing infrastructure needed. You just need to:
1. Create the app in Partner Dashboard
2. Configure production URLs
3. Submit for review
4. Start marketing!

Good luck with your app launch! 🚀


