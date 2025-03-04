# TradeHaven Express

A modern, feature-rich e-commerce platform built with React, Vite, and Supabase.

## Features

- 🎨 Modern UI with dark/light mode support
- 🔒 Secure authentication with Supabase
- 📱 Responsive design for all devices
- 🚀 Performance optimized
- 🔍 Real-time search
- 🛒 Shopping cart functionality
- 👤 User profiles
- 📊 Analytics dashboard
- 🌐 Network-aware components
- 🔐 Two-factor authentication
- 📈 Activity monitoring
- 🎯 Dynamic layouts

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Backend/Auth**: Supabase
- **State Management**: React Query
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Routing**: React Router
- **UI Components**: Radix UI
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- A Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tradehaven-express.git
   cd tradehaven-express
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Go to Project Settings -> API
3. Copy the Project URL and anon/public key
4. Update your `.env` file with these values

## Project Structure

```
src/
├── components/         # Reusable UI components
├── contexts/          # React context providers
├── hooks/             # Custom React hooks
├── lib/              # Utility functions and configurations
├── pages/            # Route components
├── services/         # API and service integrations
├── styles/           # Global styles and theme
└── types/            # TypeScript type definitions
```

## Features in Detail

### Authentication
- Email/Password login
- OAuth providers
- Two-factor authentication
- Session management
- Password recovery

### User Profile
- Avatar upload
- Personal information
- Security settings
- Notification preferences
- Activity history

### Shopping Features
- Product browsing
- Category filtering
- Cart management
- Wishlist
- Search functionality

### Performance
- Dynamic imports
- Image optimization
- Network-aware loading
- Caching strategies
- Offline support

### Security
- CSRF protection
- XSS prevention
- Rate limiting
- Input validation
- Secure headers

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Code Style

The project uses ESLint and Prettier for code formatting. Configuration files are included in the repository.

### Environment Variables

Required environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

Optional environment variables:

- `VITE_API_URL`: Custom API endpoint
- `VITE_ENABLE_ANALYTICS`: Enable/disable analytics
- `VITE_ENVIRONMENT`: Development/staging/production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@tradehaven.com or open an issue in the repository.

## Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [TailwindCSS](https://tailwindcss.com) for the styling system
- [Vite](https://vitejs.dev) for the build tooling
