# Future-Proof Restaurant Management System

A comprehensive restaurant management system that predicts inventory needs, optimizes food usage, and creates timely promotions to help restaurants minimize waste and maximize profits.

## Project Overview

Future-Proof is a full-stack application designed to help restaurant owners and managers make data-driven decisions about inventory management and customer promotions. The system predicts how much food a restaurant needs to buy or sell, tracks inventory levels, and creates targeted promotions to help sell excess inventory or offer alternatives when supplies are low.

## Key Features

- **Sales Prediction**: Interactive charts showing forecasted sales for menu items over the next 5 days
- **Inventory Management**: Real-time tracking of ingredient levels and usage
- **Intelligent Promotions**: Automated promotion recommendations based on inventory status
- **Multi-Restaurant Support**: Support for managing multiple restaurant locations
- **Campaign Deduplication**: Prevention of duplicate promotions based on unique campaign identifiers
- **Automatic Database Seeding**: Database is automatically populated with sample data when empty

## Project Structure

This is a monorepo containing both frontend and backend code:

```
future-proof/
├── backend/            # FastAPI backend service
└── frontend/           # Next.js frontend application
```

## Documentation

Detailed documentation for each part of the application can be found in their respective directories:

- [Backend Documentation](./backend/README.md) - FastAPI service providing the REST API
- [Frontend Documentation](./frontend/README.md) - Next.js application providing the user interface

## Getting Started

To get started with the Future-Proof system, you'll need to set up both the backend and frontend services:

1. Start the backend server first (see [Backend Documentation](./backend/README.md))
2. Then start the frontend application (see [Frontend Documentation](./frontend/README.md))

## Technology Stack

- **Backend**: Python, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Recharts
- **Deployment**: Docker and Docker Compose
