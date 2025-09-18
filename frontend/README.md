# PatchDB Frontend

A mobile-first web application for managing and organizing patch collections using image recognition.

## Features

- **Simple Authentication**: Username-only login system
- **Mobile-First Design**: Responsive layout optimized for mobile devices
- **Image Upload**: Take photos or upload from device gallery
- **Duplicate Detection**: AI-powered matching to avoid duplicate patches
- **Collection Management**: Organize patches into named groups
- **Search & Filter**: Find patches in your collection quickly

## Pages

### 1. Login (`index.html`)
- Simple username input for authentication
- Auto-redirects if already logged in
- Clean, centered design with loading states

### 2. Dashboard (`dashboard.html`)
- User greeting and collection statistics
- Quick action card for uploading patches
- Full patch collection with search and filtering
- Group management and organization features

### 3. Upload (`upload.html`)
- Multiple upload methods: camera, file upload, drag & drop
- Real-time camera preview with capture functionality
- Image preview and resizing before upload
- Mobile-optimized camera controls

### 4. Match Results (`matches.html`)
- Shows uploaded patch and potential matches
- Interactive selection of matching groups
- Options to add to existing group or create new patch
- Confidence scores for matches


## Files Structure

```
frontend/
├── index.html      # Login/Authentication page
├── dashboard.html  # Main dashboard with integrated collection
├── upload.html     # Patch upload interface
├── matches.html    # Duplicate detection results
├── style.css      # Mobile-first styles
├── app.js         # JavaScript utilities and API calls
└── README.md      # This file
```

## Design Principles

### Mobile-First
- Responsive grid system using Bootstrap
- Touch-friendly interface elements
- Optimized for small screens first

### Minimal Color Palette
- Primary: Dark (#212529)
- Secondary: Gray (#6c757d)
- Background: Light gray (#f8f9fa)
- Accent: White with subtle shadows

### Clean & Consistent
- Bootstrap components for consistency
- Card-based layout for content organization
- Consistent spacing and typography
- Loading states and error handling

## Browser Support

- Modern mobile browsers (iOS Safari, Chrome Mobile)
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Progressive enhancement for camera features

## API Integration

The frontend integrates with the backend API using these endpoints:

- `POST /user` - Authentication/registration
- `POST /{userId}/upload` - Upload patch images
- `PATCH /{userId}/group` - Add patch to existing group
- `POST /{userId}/group` - Create new patch group
- `GET /{userId}/patches` - Retrieve user's collection

## Local Storage

- `userId` - Current user ID
- `username` - Current username
- Session storage for upload results during match flow

## Getting Started

1. Ensure the backend server is running
2. Open `index.html` in a web browser
3. Enter a username to login/register
4. Start uploading patches to build your collection

## Technical Features

- **Image Resizing**: Automatic compression for large images
- **Camera Support**: WebRTC camera access with fallback
- **Drag & Drop**: File dropping support for desktop users
- **Search**: Real-time filtering of patch collection
- **Error Handling**: Comprehensive error messages and loading states
- **Accessibility**: Semantic HTML and keyboard navigation support
