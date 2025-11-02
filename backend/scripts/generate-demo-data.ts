import axios from 'axios';

const API_URL = 'http://localhost:3001';
const SHOP_ID = 'demo-shop';

const products = [
  { title: 'Premium Headphones', price: 299.99 },
  { title: 'Wireless Keyboard', price: 149.99 },
  { title: 'Smart Watch', price: 399.99 },
  { title: 'USB-C Hub', price: 79.99 },
  { title: 'Webcam 4K', price: 189.99 },
  { title: 'Mechanical Mouse', price: 89.99 },
  { title: 'Monitor 27"', price: 449.99 },
  { title: 'Laptop Stand', price: 59.99 },
];

const locations = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Miami, FL',
  'Seattle, WA',
  'Boston, MA',
  'Austin, TX',
  'Denver, CO',
  'Portland, OR',
];

const devices = ['desktop', 'mobile', 'tablet'];
const sources = ['google', 'facebook', 'direct', 'instagram', 'email', 'twitter'];

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
    } catch (error: any) {
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

    const value = Math.random() * 400 + 100;

    const data = {
      cartAbandonmentId: id,
      shopId: SHOP_ID,
      popupId: '66759126-0106-4c39-aa0b-877f97bc8e14',
      recoveryValue: value,
      recoveryMethod: ['exit_popup', 'time_delay_popup', 'scroll_popup'][Math.floor(Math.random() * 3)],
      offerUsed: ['20% OFF', '15% OFF', 'FREE SHIP', '10% OFF'][Math.floor(Math.random() * 4)],
    };

    try {
      await axios.post(`${API_URL}/revenue/track-recovery`, data);
      console.log(`🎉 Cart recovered: $${data.recoveryValue.toFixed(2)}`);
    } catch (error: any) {
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
