'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function TestPopupPage() {
  useEffect(() => {
    // Show console message
    console.log('✨ ExitIntent Pro test page loaded!');
    console.log('📍 Create a popup at: http://localhost:3000/popups/new');
    console.log('🔄 Then refresh this page to test it!');

    // Add interactivity to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      if (btn.textContent?.includes('Add to Cart')) {
        btn.addEventListener('click', () => {
          btn.textContent = '✓ Added!';
          (btn as HTMLElement).style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
          setTimeout(() => {
            btn.textContent = 'Add to Cart';
            (btn as HTMLElement).style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          }, 2000);
        });
      }
    });
  }, []);

  const testPopup = () => {
    // Simulate exit intent
    const event = new MouseEvent('mouseout', {
      bubbles: true,
      cancelable: true,
      clientY: 0,
      relatedTarget: null
    });
    document.dispatchEvent(event);
  };

  return (
    <>
      <Script
        src="http://localhost:3001/scripts/popup.js?shopId=demo-shop"
        strategy="afterInteractive"
      />

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 200vh;
          padding: 40px 20px;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 60px 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        h1 {
          font-size: 48px;
          color: #1a202c;
          margin-bottom: 20px;
          text-align: center;
        }

        .subtitle {
          text-align: center;
          font-size: 20px;
          color: #718096;
          margin-bottom: 60px;
        }

        .product-card {
          background: #f7fafc;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          border: 2px solid #e2e8f0;
        }

        .product-card h2 {
          color: #2d3748;
          margin-bottom: 15px;
        }

        .product-card p {
          color: #4a5568;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .price {
          font-size: 32px;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 20px;
        }

        button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 16px 40px;
          font-size: 18px;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }

        .instructions {
          background: #fff5f5;
          border-left: 4px solid #f56565;
          padding: 20px;
          margin-bottom: 40px;
          border-radius: 8px;
        }

        .instructions h3 {
          color: #c53030;
          margin-bottom: 10px;
        }

        .instructions ul {
          margin-left: 20px;
          color: #742a2a;
        }

        .instructions li {
          margin-bottom: 8px;
        }

        .success {
          background: #f0fff4;
          border-left: 4px solid #48bb78;
          padding: 20px;
          margin-bottom: 40px;
          border-radius: 8px;
        }

        .success h3 {
          color: #22543d;
          margin-bottom: 10px;
        }

        .success p {
          color: #2f855a;
        }

        .cart-items {
          margin: 40px 0;
        }

        .cart-item {
          display: flex;
          justify-content: space-between;
          padding: 15px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .total {
          font-size: 24px;
          font-weight: bold;
          text-align: right;
          margin-top: 20px;
          color: #2d3748;
        }

        code {
          background: #2d3748;
          color: #48bb78;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }

        .warning {
          background: #fffaf0;
          border-left: 4px solid #ed8936;
          padding: 20px;
          margin: 40px 0;
          border-radius: 8px;
        }

        .warning h3 {
          color: #c05621;
          margin-bottom: 10px;
        }

        .warning p {
          color: #7c2d12;
          margin-bottom: 10px;
        }
      `}</style>

      <div className="container">
        <h1>🛍️ Test Store</h1>
        <p className="subtitle">Test your exit-intent popup below</p>

        <div className="success">
          <h3>✅ Popup Script Loaded!</h3>
          <p>The ExitIntent Pro script is active on this page. Try the triggers below to see your popup in action.</p>
        </div>

        <div className="instructions">
          <h3>📋 How to Test Your Popup:</h3>
          <ul>
            <li><strong>Desktop (Exit Intent):</strong> Move your mouse cursor to the top of the browser window, as if you're about to leave</li>
            <li><strong>Mobile (Scroll):</strong> Scroll down about 40% of the page</li>
            <li><strong>Time Delay:</strong> Wait 5 seconds (if you configured this trigger)</li>
            <li><strong>Quick Test:</strong> Click the "Trigger Popup" button below</li>
          </ul>
        </div>

        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <button onClick={testPopup}>🚀 Trigger Popup Now</button>
        </div>

        <div className="warning">
          <h3>⚠️ Testing on Your Shopify Store</h3>
          <p><strong>In Development Mode:</strong> The popup won't work on your actual Shopify store because:</p>
          <ul>
            <li>Script tags require public HTTPS URLs (not localhost)</li>
            <li>Your Shopify store can't access <code>http://localhost:3001</code></li>
          </ul>
          <p style={{ marginTop: '15px' }}><strong>For Production:</strong> Deploy your app to a public domain with HTTPS, and it will work automatically!</p>
        </div>

        <h2 style={{ margin: '60px 0 30px 0', color: '#2d3748' }}>Sample Products</h2>

        <div className="product-card">
          <h2>Premium Headphones</h2>
          <p>High-quality wireless headphones with noise cancellation and 30-hour battery life.</p>
          <div className="price">$299.99</div>
          <button>Add to Cart</button>
        </div>

        <div className="product-card">
          <h2>Wireless Keyboard</h2>
          <p>Mechanical keyboard with RGB lighting and wireless connectivity for the ultimate typing experience.</p>
          <div className="price">$149.99</div>
          <button>Add to Cart</button>
        </div>

        <div className="product-card">
          <h2>Smart Watch</h2>
          <p>Track your fitness, receive notifications, and stay connected with this stylish smartwatch.</p>
          <div className="price">$399.99</div>
          <button>Add to Cart</button>
        </div>

        <div className="cart-items">
          <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>Shopping Cart</h2>
          <div className="cart-item">
            <span>Premium Headphones</span>
            <span>$299.99</span>
          </div>
          <div className="cart-item">
            <span>Wireless Keyboard</span>
            <span>$149.99</span>
          </div>
          <div className="total">Total: $449.98</div>
        </div>

        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <button style={{ fontSize: '20px', padding: '20px 60px' }}>Proceed to Checkout</button>
        </div>

        <div style={{ marginTop: '100px', padding: '40px', background: '#f7fafc', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>💡 Tip</h3>
          <p style={{ color: '#4a5568' }}>
            Once you've created a popup in the dashboard at <code>http://localhost:3000/popups/new</code>,
            refresh this page to test it!
          </p>
        </div>
      </div>
    </>
  );
}
