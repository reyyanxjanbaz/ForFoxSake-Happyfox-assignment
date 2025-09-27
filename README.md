# For Fox Sake Org Chart

A modern, accessible organizational chart application built with React, TypeScript, and React Flow. Features responsive design, smooth animations, and comprehensive keyboard navigation.

![For Fox Sake Org Chart](https://via.placeholder.com/800x400/f97316/ffffff?text=For+Fox+Sake+Org+Chart)

## 🚀 Live Demo

- **Production URL**: _[Coming Soon]_
- **Demo Video**: _[Coming Soon - See DEMO_VIDEO_PLAN.md]_

## ✨ Features

### Core Functionality

- **Interactive Org Chart**: Hierarchical organization visualization using React Flow
- **Sidebar Navigation**: Collapsible tree structure with employee profiles
- **Responsive Design**: Mobile-first approach with breakpoints for all screen sizes
- **Smooth Animations**: Framer Motion-powered transitions and micro-interactions
- **Accessibility First**: WCAG AA compliant with full keyboard navigation

### Technical Highlights

- **TypeScript**: Complete type safety and IntelliSense support
- **Modern React**: Hooks, context, and functional components
- **Performance Optimized**: Lazy loading, code splitting, and asset optimization
- **Mock Data**: MirageJS integration for development and testing
- **Constitutional Design**: White/orange theme with performance constraints

### User Experience

- **Keyboard Navigation**: Full app navigable via keyboard only
- **Focus Management**: Proper focus traps and ARIA labels
- **Loading States**: Elegant spinners and progressive enhancement
- **Error Handling**: Graceful fallbacks and user feedback
- **Touch Friendly**: Optimized for mobile and tablet interactions

## 🛠️ Technology Stack

### Frontend Framework

- **React 18** - UI library with concurrent features
- **TypeScript 5** - Static type checking and enhanced DX
- **Vite** - Fast build tool and development server

### Visualization & Animation

- **React Flow** - Interactive node-based diagrams
- **Framer Motion** - Production-ready motion library
- **Dagre** - Automatic graph layout algorithms

### Development & Testing

- **Jest** - JavaScript testing framework
- **Testing Library** - Simple and complete testing utilities
- **ESLint** - JavaScript linting and code quality
- **Prettier** - Code formatting and style consistency

### Data & Mocking

- **MirageJS** - API mocking for development
- **Faker.js** - Generate realistic test data

## 📋 Prerequisites

- **Node.js** 18 or higher
- **npm** 9 or higher
- Modern browser with ES2020+ support

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/for-fox-sake.git
cd for-fox-sake

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5174/`

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run preview      # Preview production build locally

# Building
npm run build        # Create production build
npm run build:ci     # Build with linting and testing

# Quality Assurance
npm run test         # Run test suite
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Deployment
npm run deploy:netlify  # Deploy to Netlify
npm run deploy:vercel   # Deploy to Vercel
```

## 🏗️ Project Structure

```
for-fox-sake/
├── src/
│   ├── app/                    # Main application component
│   ├── components/             # Reusable UI components
│   │   ├── shared/            # Shared components (ProfileCard, etc.)
│   │   └── sidebar/           # Sidebar-specific components
│   ├── features/              # Feature-based modules
│   │   └── org-chart/         # Org chart feature
│   │       ├── components/    # Feature components
│   │       ├── context/       # React context providers
│   │       ├── hooks/         # Custom hooks
│   │       ├── services/      # API and business logic
│   │       ├── state/         # State management
│   │       └── utils/         # Utility functions
│   ├── hooks/                 # Global custom hooks
│   ├── mocks/                 # MirageJS server configuration
│   └── styles/                # Global styles and CSS variables
├── tests/                     # Test suites
│   ├── contract/              # API contract tests
│   ├── integration/           # Integration tests
│   └── unit/                  # Unit tests
├── config/                    # Configuration files
├── public/                    # Static assets
└── specs/                     # Feature specifications
```

## 🎨 Design System

### Color Palette

- **Primary Orange**: `#f97316` - Interactive elements
- **White**: `#ffffff` - Main surfaces
- **Gray Scale**: Various shades for text and borders
- **Focus**: Orange-based focus rings for accessibility

### Typography

- **Primary Font**: System font stack for optimal performance
- **Sizes**: Responsive typography with consistent scale
- **Weights**: 400 (normal), 500 (medium), 600 (semibold)

### Spacing & Layout

- **CSS Custom Properties**: Consistent spacing scale
- **Grid System**: CSS Grid for main layout
- **Responsive Breakpoints**: 480px, 640px, 768px, 1024px

## ♿ Accessibility Features

### Keyboard Navigation

- **Full Keyboard Support**: Navigate entire app without mouse
- **Focus Management**: Proper focus indicators and trapping
- **Screen Reader**: ARIA labels and semantic HTML

### Interaction Patterns

- **Tree Navigation**: Arrow keys, Enter, Space for tree control
- **Canvas Navigation**: Arrow keys to navigate org chart nodes
- **Modal Focus Traps**: Tab key cycling within modals

### Responsive Design

- **Mobile First**: Optimized for small screens
- **Touch Targets**: Minimum 44px touch targets
- **Viewport Units**: Dynamic viewport height support

## 🧪 Testing Strategy

### Test Types

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: Feature interaction tests
- **Contract Tests**: API schema validation

### Coverage Areas

- Component rendering and props
- User interactions and events
- Data transformations and utilities
- API contract compliance
- Accessibility features

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage
```

## 🚀 Deployment

The application is configured for multiple deployment platforms:

### Netlify (Recommended)

```bash
npm run deploy:netlify
```

### Vercel

```bash
npm run deploy:vercel
```

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📊 Performance

### Bundle Size

- **JavaScript**: ~262KB (85KB gzipped)
- **CSS**: ~10KB (3KB gzipped)
- **Total**: ~273KB (88KB gzipped)

### Optimizations

- **Code Splitting**: Automatic route-based chunks
- **Lazy Loading**: Images loaded on demand
- **Asset Caching**: Long-term browser caching
- **Tree Shaking**: Unused code elimination

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Write tests for new features
- Maintain accessibility standards
- Follow the constitutional design principles

## 📝 Architecture Decisions

### Why React Flow?

- Professional org chart visualization
- Built-in zoom, pan, and minimap
- Extensible node system
- Accessibility support

### Why Framer Motion?

- Production-ready animations
- React-first API design
- Performance optimizations
- Accessibility considerations

### Why MirageJS?

- Full-featured API mocking
- Realistic development experience
- No backend dependency
- Easy testing integration

### Why TypeScript?

- Enhanced developer experience
- Compile-time error catching
- Better refactoring support
- Self-documenting code

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👥 Team

Built with ❤️ for the For Fox Sake organization.

## 📞 Support

- **Documentation**: Check the `specs/` folder for detailed specifications
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

---

**Status**: Production Ready ✅ | **Version**: 0.0.1 | **Last Updated**: September 2025
