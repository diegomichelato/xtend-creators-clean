# Xtend Outreach Platform

## Overview

This is a cutting-edge SaaS platform for creator video inventory management with intelligent marketing and collaboration technologies. The platform features AI-driven research, proposal generation, email outreach capabilities, and comprehensive contact management for creator-brand partnerships.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Overall Structure
- **Frontend**: React.js with TypeScript, Tailwind CSS, and Shadcn UI components
- **Backend**: Node.js with Express server
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase-based authentication system with UUID-based user sessions
- **Email Services**: SendGrid for transactional emails, SMTP integration for outreach
- **AI Integration**: OpenAI and Anthropic APIs for research and content generation

### Key Technical Decisions
- **Database ORM**: Drizzle ORM chosen for type-safe database operations
- **Authentication**: Supabase provides scalable auth with row-level security
- **Email Strategy**: Dual approach with SendGrid for system emails and SMTP for outreach campaigns
- **Frontend State**: React Query for server state management
- **Styling**: Tailwind CSS with custom brand colors (dark purple, gold, pink)

## Key Components

### 1. User Management & Authentication
- **Supabase Integration**: UUID-based user system with proper foreign key relationships
- **Registration System**: Stable v1 implementation with user creation, profile updates, and welcome emails
- **Role-based Access**: Admin and regular user roles with appropriate permissions

### 2. Contact Management System
- **Contact Database**: Comprehensive contact storage with companies, roles, and industries
- **Contact Lists**: Organized contact management with list-based categorization
- **Import Capabilities**: Excel/CSV import functionality for bulk contact uploads
- **Data Validation**: Proper email validation and duplicate detection

### 3. Email Outreach Platform
- **SMTP Integration**: Multi-account SMTP support with Gmail App Password compatibility
- **Email Health Monitoring**: Deliverability tracking, bounce handling, and account health dashboards
- **Campaign Management**: Scheduled email campaigns with personalization
- **Error Handling**: Comprehensive SMTP error categorization and troubleshooting

### 4. Creator Management
- **Creator Profiles**: Rich creator data with social stats, audience demographics, and brand voice
- **Platform Analytics**: Multi-platform statistics (Instagram, YouTube, TikTok, etc.)
- **Content Integration**: Google Drive folder integration for asset management

### 5. Proposal System
- **AI-Powered Research**: Company and creator ecosystem analysis
- **Proposal Generation**: Automated proposal creation with creator fits and pricing
- **Landing Pages**: Shareable landing pages for proposals
- **Pipeline Management**: Sales pipeline with company information tracking

### 6. Email Account Management
- **Direct Supabase Integration**: Bypasses backend routes for real-time updates
- **SMTP Configuration**: Support for Gmail, Outlook, and custom SMTP providers
- **Authentication Testing**: Built-in SMTP connection testing
- **App Password Support**: Gmail 2FA compatibility

## Data Flow

### User Registration Flow
1. User submits registration form
2. Create user in Supabase Auth with UUID
3. Update profile table with user details
4. Send welcome email via SendGrid
5. Return success response with user data

### Email Outreach Flow
1. User configures SMTP account
2. System validates SMTP connection
3. User creates contact lists and campaigns
4. Emails are queued and sent through configured SMTP
5. Delivery status tracked and logged

### Contact Management Flow
1. Contacts imported via Excel/CSV or manual entry
2. Data normalized and validated
3. Stored in contacts table with user association
4. Organized into contact lists for campaign targeting

## External Dependencies

### Core Services
- **Supabase**: Authentication, database, and real-time subscriptions
- **SendGrid**: Transactional email delivery with template support
- **OpenAI**: AI-powered research and content generation
- **Anthropic**: Additional AI capabilities for analysis

### Database & Storage
- **PostgreSQL**: Primary database with Drizzle ORM
- **Neon Database**: Serverless PostgreSQL hosting
- **Google Drive**: Asset storage and management integration

### Email Infrastructure
- **SMTP Providers**: Gmail, Outlook, custom SMTP support
- **Email Validation**: Built-in validation and deliverability checking
- **Bounce Handling**: Comprehensive error tracking and categorization

## Deployment Strategy

### Environment Configuration
- **Development**: Local development with hot reloading
- **Production**: Node.js server with environment-based configuration
- **Database**: PostgreSQL with migration support via Drizzle

### Required Environment Variables
```
DATABASE_URL - PostgreSQL connection string
SUPABASE_URL - Supabase project URL
SUPABASE_ANON_KEY - Supabase anonymous key
SENDGRID_API_KEY - SendGrid API key for transactional emails
OPENAI_API_KEY - OpenAI API key for AI features
ANTHROPIC_API_KEY - Anthropic API key for additional AI capabilities
```

### Build Process
- **Frontend**: Vite build system for optimized React bundle
- **Backend**: ESBuild for Node.js server bundling
- **Database**: Drizzle migrations for schema management

### Monitoring & Health Checks
- **Email Health**: Comprehensive email deliverability monitoring
- **Database**: Connection health and query performance tracking
- **API Health**: Endpoint availability and response time monitoring

### Security Considerations
- **Authentication**: Supabase row-level security policies
- **API Keys**: Secure environment variable management
- **Email Security**: SMTP authentication with app passwords
- **Data Validation**: Input sanitization and schema validation with Zod