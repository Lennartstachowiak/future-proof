# Future-Proof Restaurant Frontend

A modern, interactive web application for restaurant inventory management, sales forecasting, and promotion optimization. This frontend application complements the Future-Proof backend API.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Application Routes](#application-routes)
- [Components](#components)
- [Context Providers](#context-providers)
- [API Integration](#api-integration)
- [Development](#development)

## Technology Stack

- **Next.js 14**: React framework with App Router for modern web development
- **React 18**: Component-based UI library
- **TypeScript**: Type-safe programming language
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Composable charting library for data visualization
- **Geist UI**: Clean, modern UI components and typography

## Features

- **Sales Forecasting**: Interactive charts showing predicted sales for menu items
- **Inventory Management**: Real-time tracking of ingredient levels and usage
- **Promotion Creation**: Tools to create targeted promotions based on inventory status
- **Restaurant Selection**: Context-based restaurant selection across the application
- **Responsive Design**: Mobile-friendly interface that works on all devices

## Project Structure

```
frontend/
├── app/                    # App router-based Next.js application
│   ├── components/         # Shared UI components
│   │   ├── layout/         # Layout components (Dashboard, Sidebar)
│   │   └── ui/             # Reusable UI components
│   ├── context/            # React context providers
│   │   └── RestaurantContext.tsx # Global restaurant state management
│   ├── forecast/           # Forecast page and components
│   │   ├── components/     # Forecast-specific components
│   │   └── page.tsx        # Forecast page component
│   ├── inventory/          # Inventory management page
│   │   └── page.tsx        # Inventory page component
│   ├── promotion/          # Promotion management page
│   │   └── page.tsx        # Promotion page component
│   ├── utils/              # Utility functions
│   │   └── api.ts          # API integration helpers
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Home page component
├── public/                 # Static assets
├── .gitignore              # Git ignore file
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies and scripts
├── postcss.config.mjs      # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm, yarn, or pnpm
- The Future-Proof backend service running (see backend README)

### Installation

1. Clone the repository

2. Navigate to the frontend directory

```bash
cd future-proof/frontend
```

3. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Running the Application

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at http://localhost:3000

## Application Routes

- **/** - Home page/dashboard
- **/forecast** - Sales forecasting and analytics
- **/inventory** - Inventory management and tracking
- **/promotion** - Promotion creation and management

## Components

### Layout Components

- **DashboardLayout**: Main application layout with sidebar navigation
- **Sidebar**: Navigation sidebar with links to main sections

### Feature Components

- **ForecastChart**: Interactive chart displaying sales forecasts
- **InventoryForecast**: Component for showing inventory projections and creating promotions
- **InventoryList**: List of current inventory items with levels
- **PromotionForm**: Form for creating new promotional campaigns

## Context Providers

- **RestaurantContext**: Global context for managing restaurant selection and data
  - Provides the current selected restaurant to all components
  - Fetches the list of available restaurants from the backend
  - Allows switching between different restaurants

## API Integration

The frontend communicates with the backend REST API using custom utility functions in `app/utils/api.ts`. These functions handle:  

- API request formatting
- Error handling
- Type-safe responses with TypeScript
- Authentication (when applicable)

The base URL for API requests is configured to connect to the backend service at `http://0.0.0.0:8000`.

## Development

### Running with the Backend

For full functionality, ensure the backend service is running before starting the frontend. The frontend expects the backend to be available at http://0.0.0.0:8000.

### Adding New Features

When adding new features:

1. Create new components in the appropriate directories
2. Update types in feature-specific type files
3. Use the RestaurantContext to access the current restaurant
4. Use the API utility functions for backend communication

### Code Style and Conventions

- Follow TypeScript best practices with proper type definitions
- Use React Hooks for state management and side effects
- Follow the component file structure of existing features
- Use Tailwind CSS for styling components
