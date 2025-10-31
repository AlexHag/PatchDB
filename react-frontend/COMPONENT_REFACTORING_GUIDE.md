# Component Refactoring Guide

This document outlines the reusable components created to eliminate duplication in the React frontend, and provides guidance on how to continue refactoring existing pages.

## 🎯 Overview

The following reusable components have been created to eliminate code duplication:

1. **Icons** - Centralized SVG icons
2. **Loading Components** - Various loading states
3. **Alert Components** - Error/success messages
4. **EmptyState Components** - Empty state displays
5. **PatchCard Component** - Reusable patch display
6. **Pagination Component** - Reusable pagination
7. **PageLayout Components** - Common page layouts
8. **Utility Components** - Role badges, user cards, search filters

## 📁 Component Structure

```
src/components/
├── Icons.tsx                    # All SVG icons
├── Loading.tsx                  # Loading states and spinners
├── Alert.tsx                    # Alert/notification components
├── EmptyState.tsx              # Empty state displays
├── PatchCard.tsx               # Reusable patch cards
├── Pagination.tsx              # Pagination component
├── PageLayout.tsx              # Page layout templates
└── common/
    ├── RoleBadge.tsx           # User role badges
    ├── UserCard.tsx            # User profile cards
    └── SearchFilters.tsx       # Search filter components
```

## 🔧 Component Usage Examples

### Icons
```tsx
import { HomeIcon, SearchIcon, CameraIcon } from '../components/Icons';

// Usage
<HomeIcon className="my-icon-class" size={24} />
<SearchIcon />
<CameraIcon size={32} />
```

### Loading Components
```tsx
import { LoadingSpinner, LoadingPage, LoadingOverlay, LoadingButton } from '../components/Loading';

// Inline spinner
<LoadingSpinner size="sm" color="text-primary" />

// Full page loading
<LoadingPage message="Loading patches..." />

// Overlay loading
<LoadingOverlay show={loading} message="Saving..." />

// Button with loading state
<LoadingButton loading={saving} loadingText="Saving..." className="btn btn-primary">
  Save Changes
</LoadingButton>
```

### Alert Components
```tsx
import { Alert, SuccessAlert, ErrorAlert } from '../components/Alert';

// Generic alert
<Alert type="success" message="Data saved!" onDismiss={() => setSuccess('')} />

// Specific alert types
<SuccessAlert message="Upload successful!" />
<ErrorAlert message="Failed to save" onDismiss={() => setError('')} />
```

### Empty States
```tsx
import { EmptyState, NoCollectionState, NoSearchResultsState } from '../components/EmptyState';

// Generic empty state
<EmptyState 
  title="No items found"
  description="Try adjusting your filters"
  action={{
    label: "Clear Filters",
    onClick: clearFilters
  }}
/>

// Specific empty states
<NoCollectionState onUpload={() => navigate('/upload')} />
<NoSearchResultsState onClearFilters={clearFilters} />
```

### Patch Cards
```tsx
import { PatchCard } from '../components/PatchCard';

// For user's patches
<PatchCard patch={userPatch} type="user" />

// For browsing all patches
<PatchCard patch={browsePatch} type="browse" />
```

### Page Layouts
```tsx
import { StandardPage, PageLayout, ProfilePageLayout } from '../components/PageLayout';

// Standard page with header
<StandardPage title="Browse Patches" subtitle="Explore the collection">
  {/* page content */}
</StandardPage>

// Custom layout
<PageLayout loading={loading} loadingMessage="Loading data...">
  {/* content */}
</PageLayout>
```

### Utility Components
```tsx
import { RoleBadge } from '../components/common/RoleBadge';
import { UserCard } from '../components/common/UserCard';
import { SearchFilters } from '../components/common/SearchFilters';

// Role badge
<RoleBadge role={user.role} />

// User card
<UserCard 
  user={user} 
  onCardClick={handleCardClick}
  onFollowClick={handleFollow}
  followLoading={loading}
/>

// Search filters
<SearchFilters
  isExpanded={expanded}
  onToggle={() => setExpanded(!expanded)}
  hasActiveFilters={hasFilters}
  onSearch={handleSearch}
  onClearFilters={clearFilters}
>
  {/* filter inputs */}
</SearchFilters>
```

## 🔄 Refactoring Existing Pages

### High Priority Refactoring Opportunities

1. **Dashboard.tsx**:
   - Replace patch display cards with `<PatchCard>`
   - Use `<StandardPage>` for layout
   - Replace empty state with `<NoCollectionState>`
   - Replace loading states with `<LoadingPage>` and `<LoadingOverlay>`

2. **BrowsePatches.tsx**:
   - Replace patch cards with `<PatchCard type="browse">`
   - Use `<SearchFilters>` for filter section
   - Replace pagination with `<Pagination>`
   - Use `<NoSearchResultsState>` for empty state

3. **SearchUsers.tsx**:
   - Replace user cards with `<UserCard>`
   - Use `<SearchFilters>` for filter section
   - Replace loading states with loading components

4. **Upload.tsx**:
   - Replace inline SVG icons with icon components
   - Use `<LoadingButton>` for upload button
   - Use `<Alert>` components for error/success messages

5. **Profile.tsx**:
   - Use `<ProfilePageLayout>`
   - Replace role badge logic with `<RoleBadge>`
   - Use `<Alert>` components for messages
   - Use `<LoadingButton>` for form buttons

### Step-by-Step Refactoring Process

1. **Identify patterns**: Look for repeated code structures
2. **Replace components**: Start with the most obvious replacements (icons, loading, alerts)
3. **Test functionality**: Ensure behavior remains the same
4. **Refactor layouts**: Use layout components for page structure
5. **Clean up**: Remove unused code and imports

### Example Refactoring (More.tsx)

**Before:**
```tsx
import React from 'react';
import Navigation from '../components/Navigation';

const More: React.FC = () => {
  return (
    <div className="min-vh-100 more-page">
      <Navigation />
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="text-center py-5">
              <div className="mb-4">
                <svg viewBox="0 0 24 24" fill="currentColor" className="text-muted" style={{width: '80px', height: '80px'}}>
                  <path d="M6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12A2,2 0 0,1 6,10M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12A2,2 0 0,1 18,10Z"/>
                </svg>
              </div>
              <h2 className="display-4 text-muted mb-3" style={{fontWeight: '300'}}>
                Coming Soon
              </h2>
              <p className="lead text-muted mb-4">
                This page is under construction! 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

**After:**
```tsx
import React from 'react';
import { FullWidthPageLayout } from '../components/PageLayout';
import { ComingSoonState } from '../components/EmptyState';

const More: React.FC = () => {
  return (
    <FullWidthPageLayout className="min-vh-100 more-page">
      <ComingSoonState />
    </FullWidthPageLayout>
  );
};
```

**Benefits:**
- Reduced from 30+ lines to 10 lines
- Eliminated inline SVG duplication
- Consistent styling and behavior
- Easier to maintain and modify

## 🎨 Benefits of Refactoring

1. **DRY Principle**: Eliminates code duplication
2. **Consistency**: Consistent UI patterns across the app
3. **Maintainability**: Changes in one place affect all usages
4. **Readability**: Cleaner, more semantic component usage
5. **Testing**: Easier to test individual components
6. **Performance**: Potentially better bundle optimization

## 📋 Remaining Tasks

1. Refactor Dashboard.tsx to use new components
2. Refactor BrowsePatches.tsx with PatchCard and SearchFilters
3. Refactor SearchUsers.tsx with UserCard and SearchFilters
4. Refactor Upload.tsx with icons and loading components
5. Refactor Profile.tsx with layout and utility components
6. Refactor other pages (PatchView.tsx, Matches.tsx, etc.)
7. Remove unused duplicate code
8. Add PropTypes or improve TypeScript types where needed

## 🚀 Quick Start

To begin refactoring any page:

1. Import the new components you need
2. Replace the most obvious duplications first (icons, loading states)
3. Test that functionality works
4. Continue with layout and more complex components
5. Remove old unused code

The refactoring can be done incrementally - you don't need to refactor entire pages at once. Start with small, obvious improvements and build up from there.
