# 🚀 Revenue Dashboard Demo & Testing Guide

## Overview
This guide helps you test the Revenue Recovery Dashboard with demo data and real-time updates.

---

## Quick Start

### 1. Start the Application

```bash
# Terminal 1: Start Backend
cd backend
docker-compose up

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

### 2. Access the Revenue Dashboard

Open your browser to:
- **Revenue Dashboard:** `http://localhost:3000/revenue`
- **Main Dashboard:** `http://localhost:3000/popups`
- **Test Popup Page:** `http://localhost:3000/test`

---

## Testing with Demo Data

### Method 1: API Testing with cURL

#### Track a Cart Abandonment
```bash
curl -X POST http://localhost:3001/revenue/track-abandonment \
  -H "Content-Type: application/json" \
  -d '{
    "shopId": "demo-shop",
    "sessionId": "sess_'$(date +%s)'",
    "cartValue": 234.99,
    "cartItems": [
      {
        "productTitle": "Premium Headphones",
        "quantity": 1,
        "price": 234.99
      }
    ],
    "deviceType": "desktop",
    "trafficSource": "google",
    "userLocation": "New York, NY",
    "pageUrl": "http://localhost:3000/test"
  }'
```

#### Track a Cart Recovery
First, get the abandonment ID from the response above, then:

```bash
curl -X POST http://localhost:3001/revenue/track-recovery \
  -H "Content-Type": application/json" \
  -d '{
    "cartAbandonmentId": "PASTE_ABANDONMENT_ID_HERE",
    "shopId": "demo-shop",
    "popupId": "66759126-0106-4c39-aa0b-877f97bc8e14",
    "recoveryValue": 234.99,
    "recoveryMethod": "exit_popup",
    "offerUsed": "20% OFF"
  }'
```

### Method 2: Automated Demo Data Generator

Create a file `backend/scripts/generate-demo-data.ts`:

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:3001';
const SHOP_ID = 'demo-shop';

const products = [
  { title: 'Premium Headphones', price: 299.99 },
  { title: 'Wireless Keyboard', price: 149.99 },
  { title: 'Smart Watch', price: 399.99 },
  { title: 'USB-C Hub', price: 79.99 },
  { title: 'Webcam 4K', price: 189.99 },
];

const locations = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Miami, FL',
  'Seattle, WA',
  'Boston, MA',
];

const devices = ['desktop', 'mobile', 'tablet'];
const sources = ['google', 'facebook', 'direct', 'instagram', 'email'];

async function generateAbandonments(count: number = 10) {
  const abandonmentIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const randomProducts = products
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1);

    const cartValue = randomProducts.reduce((sum, p) => sum + p.price, 0);
    const cartItems = randomProducts.map(p => ({
      productTitle: p.title,
      quantity: 1,
      price: p.price,
    }));

    const data = {
      shopId: SHOP_ID,
      sessionId: `sess_${Date.now()}_${i}`,
      cartValue,
      cartItems,
      deviceType: devices[Math.floor(Math.random() * devices.length)],
      trafficSource: sources[Math.floor(Math.random() * sources.length)],
      userLocation: locations[Math.floor(Math.random() * locations.length)],
      pageUrl: 'http://localhost:3000/test',
    };

    try {
      const response = await axios.post(`${API_URL}/revenue/track-abandonment`, data);
      console.log(`✅ Cart abandoned: $${cartValue.toFixed(2)} (ID: ${response.data.eventId})`);
      abandonmentIds.push(response.data.eventId);

      // Random delay between events (500ms - 3s)
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 2500));
    } catch (error) {
      console.error(`❌ Failed to track abandonment:`, error.message);
    }
  }

  return abandonmentIds;
}

async function generateRecoveries(abandonmentIds: string[], recoveryRate: number = 0.4) {
  const recoveriesToGenerate = Math.floor(abandonmentIds.length * recoveryRate);
  const selectedIds = abandonmentIds.sort(() => Math.random() - 0.5).slice(0, recoveriesToGenerate);

  for (const id of selectedIds) {
    // Random delay (1-5 seconds) to simulate user interaction
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 4000));

    const data = {
      cartAbandonmentId: id,
      shopId: SHOP_ID,
      popupId: '66759126-0106-4c39-aa0b-877f97bc8e14',
      recoveryValue: Math.random() * 500 + 50,
      recoveryMethod: ['exit_popup', 'time_delay_popup', 'scroll_popup'][Math.floor(Math.random() * 3)],
      offerUsed: ['20% OFF', '15% OFF', 'FREE SHIP', '10% OFF'][Math.floor(Math.random() * 4)],
    };

    try {
      await axios.post(`${API_URL}/revenue/track-recovery`, data);
      console.log(`🎉 Cart recovered: $${data.recoveryValue.toFixed(2)}`);
    } catch (error) {
      console.error(`❌ Failed to track recovery:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting Revenue Dashboard Demo Data Generator\n');

  // Generate 20 cart abandonments
  console.log('📦 Generating cart abandonments...');
  const abandonmentIds = await generateAbandonments(20);

  console.log(`\n✅ Generated ${abandonmentIds.length} abandonments\n`);

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Recover about 40% of them
  console.log('💰 Generating recoveries...');
  await generateRecoveries(abandonmentIds, 0.4);

  console.log('\n✅ Demo data generation complete!');
  console.log('📊 Open http://localhost:3000/revenue to see the dashboard');
}

main().catch(console.error);
```

Run it:
```bash
cd backend
npx ts-node scripts/generate-demo-data.ts
```

---

## Real-Time Testing

### Test WebSocket Connections

1. Open the Revenue Dashboard: `http://localhost:3000/revenue`
2. Open browser DevTools (F12) → Console
3. You should see: `WebSocket connected`
4. Send a test abandonment using curl (see above)
5. Watch the dashboard update in real-time!

### Expected Behavior

When you track an abandonment:
- ⚠️ Notification appears
- Live feed updates immediately
- Stats cards update
- Chart updates

When you track a recovery:
- 🎉 Celebration notification
- Green recovery item appears in feed
- Stats update in real-time
- Recovery rate recalculates

---

## Production Testing Checklist

### Before Deploying:

- [ ] Test cart abandonment tracking
- [ ] Test cart recovery tracking
- [ ] Verify WebSocket connections work
- [ ] Check real-time updates in dashboard
- [ ] Test with multiple concurrent users
- [ ] Verify hourly chart displays correctly
- [ ] Check top popups ranking
- [ ] Test conversion breakdown
- [ ] Verify period filters (Today/Week/Month)
- [ ] Test on mobile devices
- [ ] Check browser notifications work
- [ ] Verify all API endpoints respond correctly

---

## API Endpoints Reference

### Track Abandonment
```
POST /revenue/track-abandonment
Body: {
  shopId: string
  sessionId: string
  cartValue: number
  cartItems: Array<{productTitle, quantity, price}>
  deviceType?: string
  trafficSource?: string
  userLocation?: string
  pageUrl?: string
}
```

### Track Recovery
```
POST /revenue/track-recovery
Body: {
  cartAbandonmentId: string
  shopId: string
  popupId?: string
  recoveryValue: number
  recoveryMethod: string
  offerUsed?: string
}
```

### Get Stats
```
GET /revenue/stats?shopId=demo-shop&period=today
Response: {
  atRisk: number
  recovered: number
  recoveryRate: number
  abandonedCount: number
  recoveredCount: number
}
```

### Get Activity Feed
```
GET /revenue/activity-feed?shopId=demo-shop&limit=20
Response: Array<ActivityFeedItem>
```

### Get Hourly Breakdown
```
GET /revenue/hourly-breakdown?shopId=demo-shop
Response: Array<{hour, atRisk, recovered}>
```

### Get Top Popups
```
GET /revenue/top-popups?shopId=demo-shop&limit=5
Response: Array<{popupId, popupName, recoveryCount, totalRecovered}>
```

### Get Conversion Breakdown
```
GET /revenue/conversion-breakdown?shopId=demo-shop
Response: Array<{method, count, percentage, totalValue}>
```

---

## Troubleshooting

### WebSocket Not Connecting
- Check backend is running on port 3001
- Verify CORS is enabled
- Check browser console for errors
- Ensure firewall isn't blocking WebSocket connections

### Real-Time Updates Not Working
- Verify WebSocket is connected
- Check shopId matches between frontend and backend
- Look for errors in browser console
- Check backend logs for WebSocket gateway messages

### No Data Showing
- Verify database is running (PostgreSQL in Docker)
- Check backend logs for database connection errors
- Ensure migrations have run
- Try generating demo data with the script above

### Chart Not Rendering
- Check browser console for Chart.js errors
- Verify chart.js and react-chartjs-2 are installed
- Ensure hourly data is being fetched successfully
- Check network tab for API call responses

---

## Next Steps

1. ✅ Test the Revenue Dashboard locally
2. ✅ Generate demo data to see it in action
3. ✅ Verify real-time updates work
4. 📝 Customize the dashboard design if needed
5. 🚀 Deploy to production
6. 📊 Start tracking real cart abandonments!

---

## Pro Tips

- **Browser Notifications:** Grant notification permission for real-time alerts
- **Multiple Tabs:** Open the dashboard in multiple tabs to see multi-user sync
- **Demo Mode:** Use the demo data generator for presentations
- **Performance:** The cache updates every 5 minutes to prevent database overload
- **Monitoring:** Watch the backend logs to see WebSocket events in real-time

Enjoy your new Revenue Recovery Dashboard! 💰🚀
