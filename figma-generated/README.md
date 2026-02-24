This folder contains code generated from Build.io based on Figma designs.

⚠️ This code is NOT production-ready and NOT wired to backend logic.
It is used as:
- UI reference
- Layout structure reference
- Component styling reference

When modifying the app:
- Prefer src/ as the main implementation
- Extract or adapt UI patterns from this folder into src/components or src/screens


# Dwell Secure - Property Utility Management App

A TypeScript-based React application for managing property information, utility shutoffs, and associated people.

## Features

- **Property Management**: Add and manage properties with addresses and photos
- **Utility Tracking**: Track gas, water, and electricity shutoff locations
- **People Management**: Associate people with properties and their roles
- **Photo Upload**: Upload photos of utilities and properties
- **Mobile-First Design**: Optimized for mobile devices with a clean, modern UI

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type-safe code
- **React Router** - Client-side routing
- **Vite** - Fast build tool and dev server
- **CSS3** - Custom styling matching Figma design

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Header.tsx
│   └── PhotoUpload.tsx
├── pages/          # Page components
│   ├── Welcome.tsx
│   ├── PropertyType.tsx
│   ├── AddressInput.tsx
│   ├── EnterUtility.tsx
│   ├── Success.tsx
│   └── PropertyDetails.tsx
├── context/        # React Context for state management
│   └── AppContext.tsx
├── types/          # TypeScript type definitions
│   └── index.ts
└── styles/         # Global styles
    └── global.css
```

## Design

The application follows the Figma design specifications with:
- Color scheme using blues, grays, and accent colors
- Modern, clean interface optimized for mobile
- Consistent spacing and typography
- Smooth transitions and interactions

## State Management

Uses React Context API for managing:
- Current property data
- Utilities list
- People associated with properties
- Navigation state

## Future Enhancements

- Backend integration for data persistence
- User authentication
- Maintenance reminder notifications
- Emergency mode functionality
- Property sharing between users
- Map integration for utility locations

## License

Private - All rights reserved
