# PatchDB React Frontend

This is a React TypeScript frontend for the PatchDB application, converted from the original HTML/CSS/JavaScript implementation while maintaining exactly the same functionality and styling.

## Features

- User authentication with localStorage
- Image upload via file selection or camera capture  
- Patch matching/similarity detection
- Group management (create, delete, add patches to groups)
- Favorite system for groups
- Search and filter functionality
- Responsive design with Bootstrap 5
- Drag and drop functionality
- Image resizing and optimization
- Modal dialogs for patch details and grouping
- Loading states and error handling

## Technology Stack

- React 18
- TypeScript
- React Router v6
- Bootstrap 5.3.2
- Vite (build tool)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the react-frontend directory:
   ```bash
   cd react-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

Build the application:
```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Project Structure

```
react-frontend/
├── public/                 # Static assets
│   ├── login_background.jpg
│   └── login_background_2.jpg
├── src/
│   ├── api/               # API functions and types
│   │   ├── auth.ts        # Authentication utilities
│   │   ├── patchdb.ts     # API functions
│   │   ├── types.ts       # TypeScript types
│   │   └── utils.ts       # Utility functions
│   ├── components/        # Reusable components
│   │   ├── hooks/         # Custom React hooks
│   │   │   └── useAuth.ts # Authentication hook
│   │   └── Navigation.tsx # Navigation component
│   ├── pages/             # Page components
│   │   ├── Dashboard.tsx  # Dashboard page
│   │   ├── Login.tsx      # Login page
│   │   ├── Matches.tsx    # Match results page
│   │   └── Upload.tsx     # Upload page
│   ├── styles/            # CSS files
│   │   └── index.css      # Global styles
│   ├── App.tsx           # Main app component with routing
│   └── main.tsx          # App entry point
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## API Integration

The frontend connects to the PatchDB backend API at `/patchdb/api`. Make sure the backend server is running and accessible.

## Browser Compatibility

- Modern browsers with ES2020 support
- Camera functionality requires HTTPS in production
- WebRTC support needed for camera capture

## Notes

This React version maintains 100% functional parity with the original HTML/CSS/JavaScript implementation:
- All styling is preserved exactly as in the original
- All user interactions work identically  
- All API calls and data handling remain the same
- All responsive behavior is maintained
- Camera functionality, drag-and-drop, and all other features work as expected

The main differences are:
- Uses React components instead of vanilla JavaScript
- Uses TypeScript for better type safety
- Uses React Router for navigation
- Uses React hooks for state management
- Modular component architecture for better maintainability
