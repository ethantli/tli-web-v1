# GCP Backend API Specification

This document specifies the expected API contract between the React frontend and your GCP backend service.

## Base URL
```
http://localhost:8080 (development)
https://your-gcp-service.run.app (production)
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication Endpoints

### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1234567890
  }
}
```

### POST /auth/login
Sign in with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1234567890
  }
}
```

### GET /auth/session
Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### POST /auth/logout
Sign out current user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### POST /auth/reset-password
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "redirect_to": "https://app.example.com/reset-password"
}
```

**Response (200):**
```json
{
  "message": "Password reset email sent"
}
```

### POST /auth/update-password
Update user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

---

## Case Management Endpoints

### GET /cases/user/:userId
Get all cases for a specific user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "cases": [
    {
      "case_id": "uuid",
      "status": "submitted",
      "created_at": "2024-01-01T00:00:00Z",
      "city": "San Francisco",
      "state": "CA",
      "doc_count": 3,
      "agreement_count": 1
    }
  ]
}
```

### GET /cases/:caseId
Get detailed information for a specific case.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "summary": {
    "case_id": "uuid",
    "city": "San Francisco",
    "state": "CA",
    "incident_date": "2024-01-01",
    "description": "Car accident on Highway 101",
    "status": "submitted",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "consent_store": true,
    "consent_contact": true,
    "consent_at": "2024-01-01T00:00:00Z"
  },
  "incident": {
    "id": "uuid",
    "case_id": "uuid",
    "city": "San Francisco",
    "state_code": "CA",
    "incident_date": "2024-01-01",
    "description": "Car accident on Highway 101",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "damages": {
    "id": "uuid",
    "case_id": "uuid",
    "medical_expenses": 5000,
    "property_damage": 10000,
    "lost_wages": 2000,
    "pain_suffering": "Moderate",
    "other_damages": "None"
  },
  "contact": {
    "id": "uuid",
    "case_id": "uuid",
    "preferred_contact_method": "email",
    "best_time_to_call": "morning"
  },
  "parties": [],
  "documents": [],
  "agreements": [],
  "caseInfo": {
    "id": "uuid",
    "user_id": "uuid",
    "status": "submitted",
    "consent_store": true,
    "consent_contact": true,
    "consent_at": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### POST /cases
Create a new case.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "user_id": "uuid",
  "status": "submitted",
  "consent_store": true,
  "consent_contact": true,
  "consent_at": "2024-01-01T00:00:00Z"
}
```

**Response (201):**
```json
{
  "id": "uuid"
}
```

### DELETE /cases/:caseId
Delete a case.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Case deleted successfully"
}
```

---

## Intake Endpoints

### POST /incidents
Create incident record.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "case_id": "uuid",
  "city": "San Francisco",
  "state_code": "CA",
  "incident_date": "2024-01-01",
  "description": "Car accident on Highway 101"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "message": "Incident created successfully"
}
```

### POST /damages
Create damages record.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "case_id": "uuid",
  "medical_expenses": 5000,
  "property_damage": 10000,
  "lost_wages": 2000,
  "pain_suffering": "Moderate",
  "other_damages": null
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "message": "Damages created successfully"
}
```

### POST /case-contact
Create case contact information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "case_id": "uuid",
  "preferred_contact_method": "email",
  "best_time_to_call": "morning"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "message": "Contact info created successfully"
}
```

### POST /parties
Create party records.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "parties": [
    {
      "case_id": "uuid",
      "party_type": "defendant",
      "full_name": "John Doe",
      "contact_info": "john@example.com"
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "Parties created successfully"
}
```

### POST /documents
Create document record.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "case_id": "uuid",
  "file_name": "police_report.pdf",
  "storage_path": "user_id/case_id/file_uuid.pdf",
  "public_url": "https://storage.googleapis.com/...",
  "content_type": "application/pdf",
  "file_size": 102400
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "message": "Document created successfully"
}
```

---

## User Profile Endpoints

### POST /user-profile
Create or update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "user_id": "uuid",
  "role": "client",
  "full_name": "Jane Doe",
  "phone": "+1234567890"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully"
}
```

### GET /user-profile/:userId
Get user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "full_name": "Jane Doe"
}
```

---

## File Management Endpoints

### POST /files/upload
Upload a file.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: File to upload
- `user_id`: User ID
- `case_id`: Case ID

**Response (200):**
```json
{
  "path": "user_id/case_id/file_uuid.pdf",
  "url": "https://storage.googleapis.com/..."
}
```

### POST /files/delete
Delete files.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "paths": [
    "user_id/case_id/file1.pdf",
    "user_id/case_id/file2.pdf"
  ]
}
```

**Response (200):**
```json
{
  "message": "Files deleted successfully"
}
```

### POST /files/signed-url
Get signed URL for file access.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "path": "user_id/case_id/file.pdf",
  "expires_in": 3600
}
```

**Response (200):**
```json
{
  "url": "https://storage.googleapis.com/...?signature=..."
}
```

---

## Other Endpoints

### GET /state-codes
Get list of US state codes.

**Response (200):**
```json
{
  "state_codes": [
    {
      "code": "CA",
      "name": "California"
    },
    {
      "code": "NY",
      "name": "New York"
    }
  ]
}
```

---

## Error Responses

All endpoints should return appropriate HTTP status codes and error messages:

**400 Bad Request:**
```json
{
  "message": "Invalid request parameters"
}
```

**401 Unauthorized:**
```json
{
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "message": "Access denied"
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Internal server error"
}
```
