# Migration to TypeScript and GCP Backend

## Overview
This document outlines the migration from JavaScript to TypeScript and from Supabase to a custom GCP backend service.

## What Changed

### 1. TypeScript Migration
- All `.jsx` and `.js` files converted to `.tsx` and `.ts`
- Added comprehensive type definitions in `src/types/index.ts`
- Created `tsconfig.json` and `tsconfig.node.json` for TypeScript configuration
- Added `src/vite-env.d.ts` for Vite environment variable types

### 2. Backend Migration (Supabase → GCP)
- **Removed**: `@supabase/supabase-js` dependency
- **Created**: Custom API client (`src/lib/apiClient.ts`) for GCP backend communication
- **Updated**: All API modules to use the new GCP backend:
  - `src/api/auth.ts` - Authentication endpoints
  - `src/api/cases.ts` - Case management
  - `src/api/intake.ts` - Case intake flow
  - `src/api/userProfile.ts` - User profile management
  - `src/api/stateCodes.ts` - State codes lookup
  - `src/storage/fileUpload.ts` - File upload to GCP
  - `src/storage/paths.ts` - Storage path utilities

### 3. Environment Variables
**Old** (Supabase):
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

**New** (GCP):
```
VITE_API_URL=http://localhost:8080
```

## API Client Architecture

The new `apiClient` (`src/lib/apiClient.ts`) provides:
- Token-based authentication (JWT stored in localStorage)
- RESTful HTTP methods (GET, POST, PUT, PATCH, DELETE)
- File upload support with multipart/form-data
- Automatic error handling
- TypeScript-first design

### Usage Example
```typescript
import { apiClient } from '../lib/apiClient';

// GET request
const data = await apiClient.get<ResponseType>('/endpoint');

// POST request
const result = await apiClient.post<ResponseType>('/endpoint', { body });

// File upload
const response = await apiClient.uploadFile('/upload', file, { key: 'value' });
```

## Expected Backend API Endpoints

Your GCP backend should implement these endpoints:

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Sign in with email/password
- `POST /auth/logout` - Sign out current user
- `GET /auth/session` - Get current session
- `POST /auth/reset-password` - Request password reset
- `POST /auth/update-password` - Update user password

### Cases
- `GET /cases/user/:userId` - Get all cases for a user
- `GET /cases/:caseId` - Get detailed case information
- `POST /cases` - Create new case
- `DELETE /cases/:caseId` - Delete a case

### Intake
- `POST /incidents` - Create incident record
- `POST /damages` - Create damages record
- `POST /case-contact` - Create case contact info
- `POST /parties` - Create party records
- `POST /documents` - Create document record

### User Profile
- `POST /user-profile` - Create/update user profile
- `GET /user-profile/:userId` - Get user profile

### Files
- `POST /files/upload` - Upload file (multipart/form-data)
- `POST /files/delete` - Delete files
- `POST /files/signed-url` - Get signed URL for file access

### Other
- `GET /state-codes` - Get list of US state codes

## Type Definitions

All TypeScript types are defined in `src/types/index.ts`:
- `User` - User account information
- `Session` - Authentication session
- `Case` - Case record
- `CaseSummary` - Case list item
- `CaseDetails` - Full case details
- `Incident`, `Damages`, `CaseContact`, `Party`, `Document` - Case-related entities
- `ApiResponse<T>` - Generic API response wrapper

## Component Updates

All React components have been converted to TypeScript:
- `src/App.tsx` - Main application shell
- `src/main.tsx` - Application entry point
- `src/components/Landing.tsx` - Landing page
- `src/components/Dashboard.tsx` - User dashboard
- `src/components/IntakeForm.tsx` - Case intake form
- `src/components/CaseDetails.tsx` - Case detail view
- `src/components/ResetPassword.tsx` - Password reset

## Known Issues & Next Steps

### TypeScript Errors to Address
Some components (particularly `IntakeForm.tsx` and `CaseDetails.tsx`) have TypeScript errors that need refinement:
1. Event handler type annotations
2. API payload type mismatches with backend schema
3. Null/undefined checks for optional properties

### Recommended Actions
1. **Set up your GCP backend** to match the expected API endpoints
2. **Create a `.env` file** based on `.env.example` with your GCP API URL
3. **Review and fix TypeScript errors** in complex components
4. **Test authentication flow** with your GCP backend
5. **Update type definitions** if your backend schema differs

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## Migration Checklist

- [x] Convert all files to TypeScript
- [x] Create type definitions
- [x] Implement GCP API client
- [x] Update all API calls to use new client
- [x] Remove Supabase dependencies
- [x] Update environment variables
- [ ] Fix remaining TypeScript errors in components
- [ ] Test with GCP backend
- [ ] Update component logic to match backend response schemas
- [ ] Add comprehensive error handling
- [ ] Add loading states and user feedback
