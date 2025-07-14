# Xtend Creators Platform

A comprehensive SaaS platform for video content creators and email marketing, featuring campaign management, creator partnerships, automated email outreach, and advanced analytics.

## 🚀 Features

- **Creator Management** - Complete creator profiles with analytics and social stats
- **Email Campaigns** - Automated outreach with deliverability tracking
- **Contact System** - Advanced contact management with import/export
- **Proposal Generator** - AI-powered proposal creation and shareable landing pages
- **Analytics Dashboard** - Revenue tracking, campaign metrics, and performance insights
- **Admin Tools** - User management, system monitoring, and activity logging

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Supabase
- **Email**: SendGrid + SMTP integration
- **AI**: OpenAI and Anthropic APIs
- **Authentication**: Custom session-based auth
- **Deployment**: Replit with autoscale

## 📁 Project Structure

```
xtend-creators-platform/
├── client/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility libraries
├── server/                 # Node.js Express backend
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic
│   └── middleware/        # Express middleware
├── shared/                # Shared TypeScript types
├── public/                # Static assets
└── [config files]         # Package.json, .replit, etc.
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Supabase account
- SendGrid account

### Installation

1. Clone the repository
```bash
git clone https://github.com/diegomichelato/xtend-creators-clean.git
cd xtend-creators-platform
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your actual values
```

4. Start the development server
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## 🔧 Environment Variables

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Services
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_VERIFIED_SENDER_EMAIL=your_verified_sender_email
EMAIL_PASSWORD=your_email_password
SMTP_PASSWORD=your_smtp_password

# AI Services
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Google Services
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_google_redirect_uri
```

## 🏗️ Build & Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Replit
The project is configured for Replit deployment with autoscale:
- Push to main branch
- Replit will automatically build and deploy
- Environment variables are managed through Replit secrets

### Deploy to Other Platforms
- **Vercel**: Connect GitHub repository, add environment variables
- **Netlify**: Build command: `npm run build`, publish directory: `dist`
- **Railway**: Connect GitHub, add environment variables
- **Heroku**: Add buildpack, configure environment variables

## 📊 Database Schema

The platform uses PostgreSQL with Drizzle ORM:

- **Users** - User accounts and authentication
- **Creators** - Creator profiles and analytics
- **Contacts** - Contact management and lists
- **Campaigns** - Email campaign tracking
- **Proposals** - Proposal generation and sharing
- **Email Accounts** - SMTP account management

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Creators
- `GET /api/creators` - Get all creators
- `POST /api/creators` - Create new creator
- `GET /api/creators/:id` - Get creator details
- `PUT /api/creators/:id` - Update creator

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign

### Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create new contact
- `POST /api/contacts/import` - Import contacts from CSV/Excel

## 🎨 UI Components

Built with Tailwind CSS and custom components:
- **Dashboard** - Analytics and overview
- **Creator Cards** - Creator profile displays
- **Campaign Tables** - Campaign management interface
- **Contact Lists** - Contact organization
- **Proposal Builder** - AI-powered proposal creation

## 📈 Analytics & Monitoring

- **Revenue Tracking** - Monthly revenue and growth metrics
- **Campaign Performance** - Email open rates, click-through rates
- **Creator Analytics** - Social media stats and engagement
- **System Health** - Server monitoring and error tracking

## 🛡️ Security

- Session-based authentication
- Password encryption with bcrypt
- SQL injection protection with parameterized queries
- Rate limiting on API endpoints
- CORS configuration for secure cross-origin requests

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email dev@xtendcreators.com or open an issue on GitHub.

---

Built with ❤️ for content creators and email marketers worldwide.