# ExitIntent Pro - Shopify Exit-Intent Popup Builder

A modern, production-ready Shopify app for creating and managing exit-intent popups to capture abandoning visitors and recover lost revenue.

![ExitIntent Pro](https://img.shields.io/badge/Shopify-App-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![NestJS](https://img.shields.io/badge/NestJS-10-red)

## ✨ Features

- **🎯 Exit-Intent Detection**: Smart detection for desktop and mobile devices
- **🎨 Drag & Drop Builder**: Visual popup builder with real-time preview
- **📊 A/B Testing**: Test different designs and offers
- **📈 Advanced Analytics**: Track views, conversions, and revenue
- **✉️ Email Integration**: Capture emails and grow your subscriber list
- **💰 Discount Codes**: Generate and track automatic discount codes
- **🔐 Shopify Integration**: Seamless OAuth authentication and script tag installation

## 🚀 Tech Stack

### Backend
- **NestJS** - Modern Node.js framework
- **TypeScript** - Type-safe development
- **PostgreSQL** - Relational database
- **TypeORM** - Database ORM
- **Redis** - Caching layer
- **Docker** - Containerization

### Frontend
- **Next.js 14** - React framework with app router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- Shopify Partner Account ([Sign up here](https://partners.shopify.com/))
- Shopify Development Store

## 🏁 Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd shopify_popup_app
\`\`\`

### 2. Configure Shopify App

1. Go to [Shopify Partners Dashboard](https://partners.shopify.com/)
2. Create a new app
3. Configure the following URLs:
   - **App URL**: `http://localhost:3000`
   - **Allowed redirection URLs**: `http://localhost:3000/auth/callback`

4. Copy your credentials:
   - **API key**
   - **API secret**

### 3. Set Up Environment Variables

#### Backend Configuration

\`\`\`bash
cd backend
cp .env.example .env
\`\`\`

Edit `backend/.env`:

\`\`\`env
# Shopify Credentials (REQUIRED)
SHOPIFY_API_KEY=your-shopify-api-key
SHOPIFY_API_SECRET=your-shopify-api-secret

# Application URLs
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:3001

# Other settings use defaults from .env.example
\`\`\`

#### Frontend Configuration

\`\`\`bash
cd frontend
cp .env.example .env.local
\`\`\`

The frontend `.env.local` should contain:

\`\`\`env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
\`\`\`

### 4. Start the Application

\`\`\`bash
docker-compose up -d
\`\`\`

This starts:
- ✅ **Frontend**: http://localhost:3000
- ✅ **Backend**: http://localhost:3001
- ✅ **PostgreSQL**: localhost:5432
- ✅ **Redis**: localhost:6379

### 5. Access the Application

1. Open http://localhost:3000
2. Click "Get Started" or "Install"
3. Enter your Shopify store domain (e.g., `your-store.myshopify.com`)
4. Authorize the app in Shopify
5. Start creating popups!

## 📱 Development Mode Notes

In development (localhost), the following behavior applies:

- ⚠️ **Script Tag Installation**: Automatically skipped (Shopify requires public HTTPS URLs)
- ✅ **OAuth Flow**: Works perfectly for testing
- ✅ **All Features**: Fully functional except actual script tag deployment
- ✅ **Testing**: You can test all popup creation, analytics, and management features

## 🏗️ Project Structure

\`\`\`
shopify_popup_app/
├── backend/
│   ├── src/
│   │   ├── shopify/          # Shopify OAuth & integration
│   │   ├── popups/           # Popup CRUD operations
│   │   ├── analytics/        # Analytics tracking
│   │   ├── discount-codes/   # Discount management
│   │   ├── email-subscribers/# Email capture
│   │   ├── ab-testing/       # A/B testing
│   │   └── scripts/          # Script delivery
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Landing page
│   │   ├── install/          # Installation flow
│   │   ├── popups/           # Popup management
│   │   ├── analytics/        # Analytics dashboard
│   │   └── pricing/          # Pricing page
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
\`\`\`

## 🌐 Production Deployment

### Prerequisites

- Public HTTPS domain (REQUIRED for Shopify)
- Cloud hosting (Heroku, AWS, DigitalOcean, etc.)
- PostgreSQL database
- Redis instance

### Step 1: Update Environment Variables

\`\`\`env
# Backend .env
NODE_ENV=production
API_BASE_URL=https://api.your-domain.com
FRONTEND_URL=https://your-domain.com
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=super-secure-random-string
\`\`\`

### Step 2: Update Shopify App URLs

In Shopify Partners Dashboard:
- **App URL**: `https://your-domain.com`
- **Allowed redirection URLs**: `https://your-domain.com/auth/callback`

### Step 3: Deploy

\`\`\`bash
# Build and deploy backend
cd backend
npm run build
npm run start:prod

# Build and deploy frontend
cd frontend
npm run build
npm run start
\`\`\`

### Step 4: Run Migrations

\`\`\`bash
cd backend
npm run migration:run
\`\`\`

## 🔒 Security Features

- ✅ **HMAC Verification** - All Shopify requests verified
- ✅ **OAuth 2.0** - Secure Shopify authentication
- ✅ **Rate Limiting** - API protection
- ✅ **Input Validation** - All inputs sanitized
- ✅ **Environment Isolation** - Secrets never committed

## 🎨 Design System

The app features a unified modern dark theme:

- **Background**: Animated gradient orbs on dark slate
- **Primary**: Cyan → Sky → Emerald gradients
- **Glass Effects**: Backdrop blur with transparency
- **Typography**: Bold gradients with modern fonts
- **Animations**: Smooth transitions and hover effects

## 🐛 Troubleshooting

### Issue: Script Tag 422 Error

**Cause**: Using localhost URL in production

**Fix**: Set `API_BASE_URL` to your public HTTPS domain

### Issue: OAuth Fails

**Cause**: Redirect URL mismatch

**Fix**: Ensure Shopify redirect URLs match `FRONTEND_URL/auth/callback`

### Issue: Can't Connect to Backend

**Cause**: Frontend API URL misconfigured

**Fix**: Verify `NEXT_PUBLIC_API_BASE_URL` in frontend `.env.local`

### Issue: Database Connection Failed

**Cause**: PostgreSQL not running or wrong credentials

**Fix**: Check `DATABASE_URL` and ensure PostgreSQL container is running

## 📊 Monitoring

Check application health:

\`\`\`bash
# Backend health
curl http://localhost:3001/health

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check database
docker-compose exec postgres psql -U postgres -d exit_intent_popup
\`\`\`

## 🧪 Testing

\`\`\`bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests
cd frontend
npm run test
\`\`\`

## 📝 License

MIT License - Feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💡 Features Roadmap

- [ ] Advanced targeting rules
- [ ] More popup templates
- [ ] Email service integrations (Klaviyo, Mailchimp)
- [ ] Custom CSS editor
- [ ] Multi-language support
- [ ] SMS capture
- [ ] Advanced scheduling

## 📧 Support

For questions or issues:
- Open a GitHub issue
- Check the [Shopify App Development docs](https://shopify.dev/docs/apps)

---

**Built with ❤️ for Shopify merchants**

Made by developers, for developers. Transform your Shopify store into a conversion machine! 🚀
