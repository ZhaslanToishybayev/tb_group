# TB Group Base Stack - API Documentation

## Overview

The TB Group Base Stack API provides comprehensive backend services for the TB Group corporate website. This document describes all available API endpoints, authentication, and usage examples.

## Table of Contents

1. [Authentication](#authentication)
2. [Base URL](#base-url)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
6. [Rate Limiting](#rate-limiting)
7. [Webhooks](#webhooks)

## Authentication

### JWT Token Authentication

Most endpoints require authentication using JWT (JSON Web Tokens). Include the token in the `Authorization` header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Token Types

- **Access Token**: For API requests (short-lived)
- **Refresh Token**: For obtaining new access tokens (long-lived)

### Getting Tokens

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Response**:
```json
{
  "data": {
    "admin": {
      "id": "admin_id",
      "email": "admin@example.com",
      "name": "Admin User"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "refresh_token_here"
    }
  }
}
```

#### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

## Base URL

- **Production**: `https://api.tb-group.kz`
- **Staging**: `https://api-staging.tb-group.kz`
- **Development**: `http://localhost:4000`

## Response Format

All API responses follow a consistent format:

```json
{
  "data": {
    // Response data here
  },
  "pagination": { // For paginated responses
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  },
  "error": { // Only present for errors
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `422` - Unprocessable Entity (validation failed)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "issue": "Invalid email format"
    }
  }
}
```

## API Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
```

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
```

**Request Body**:
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### Logout
```http
POST /api/auth/logout
```

**Headers**:
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Refresh Tokens
```http
POST /api/auth/refresh-tokens
```

**Headers**:
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Get Profile
```http
GET /api/auth/profile
```

**Headers**:
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Update Profile
```http
PUT /api/auth/profile
```

**Headers**:
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

### Services

#### Get All Services
```http
GET /api/services
```

**Query Parameters**:
- `include` - Comma-separated list of related data to include (`cases,media,banners`)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response**:
```json
{
  "data": {
    "services": [
      {
        "id": "service_id",
        "slug": "web-development",
        "title": "Web Development",
        "summary": "Professional web development services",
        "heroImageUrl": "https://example.com/image.jpg",
        "iconUrl": "https://example.com/icon.svg",
        "order": 1,
        "cases": [],
        "banners": []
      }
    ]
  }
}
```

#### Get Service by Slug
```http
GET /api/services/{slug}
```

**Path Parameters**:
- `slug` - Service slug

**Query Parameters**:
- `include` - Related data to include (`cases,media,banners`)

**Response**:
```json
{
  "data": {
    "service": {
      "id": "service_id",
      "slug": "web-development",
      "title": "Web Development",
      "summary": "Professional web development services",
      "description": {
        "en": "Web development description",
        "ru": "Описание веб-разработки"
      },
      "heroImageUrl": "https://example.com/image.jpg",
      "iconUrl": "https://example.com/icon.svg",
      "order": 1,
      "cases": [],
      "banners": []
    }
  }
}
```

#### Create Service
```http
POST /api/services
```

**Headers**:
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body**:
```json
{
  "slug": "new-service",
  "title": "New Service",
  "summary": "Service summary",
  "description": {
    "en": "Service description",
    "ru": "Описание услуги"
  },
  "heroImageUrl": "https://example.com/hero.jpg",
  "iconUrl": "https://example.com/icon.svg",
  "order": 10
}
```

#### Update Service
```http
PUT /api/services/{id}
```

**Headers**:
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Updated Service Title",
  "summary": "Updated summary"
}
```

#### Delete Service
```http
DELETE /api/services/{id}
```

**Headers**:
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Cases

#### Get All Cases
```http
GET /api/cases
```

**Query Parameters**:
- `serviceId` - Filter by service ID
- `published` - Filter by published status (`true`/`false`)
- `category` - Filter by category (`WEB_DEVELOPMENT`, `MOBILE_DEVELOPMENT`, `CONSULTING`)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search in project title, client name, or summary

**Response**:
```json
{
  "data": {
    "cases": [
      {
        "id": "case_id",
        "slug": "project-example",
        "projectTitle": "Example Project",
        "clientName": "Example Client",
        "industry": "Technology",
        "summary": "Project summary",
        "challenge": "Challenge description",
        "solution": "Solution description",
        "results": "Results achieved",
        "metrics": {
          "performance": "+50%",
          "cost_reduction": "-30%"
        },
        "category": "WEB_DEVELOPMENT",
        "serviceId": "service_id",
        "heroImageUrl": "https://example.com/hero.jpg",
        "videoUrl": "https://example.com/video.mp4",
        "published": true,
        "publishedAt": "2024-01-01T12:00:00Z",
        "media": [],
        "reviews": []
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

#### Get Case by Slug
```http
GET /api/cases/{slug}
```

**Response**:
```json
{
  "data": {
    "case": {
      "id": "case_id",
      "slug": "project-example",
      "projectTitle": "Example Project",
      "clientName": "Example Client",
      "industry": "Technology",
      "summary": "Project summary",
      "challenge": "Challenge description",
      "solution": "Solution description",
      "results": "Results achieved",
      "metrics": {
        "performance": "+50%",
        "cost_reduction": "-30%"
      },
      "category": "WEB_DEVELOPMENT",
      "serviceId": "service_id",
      "heroImageUrl": "https://example.com/hero.jpg",
      "videoUrl": "https://example.com/video.mp4",
      "published": true,
      "publishedAt": "2024-01-01T12:00:00Z",
      "media": [
        {
          "id": "media_id",
          "filename": "screenshot.jpg",
          "originalName": "Screenshot",
          "mimeType": "image/jpeg",
          "size": 1024000,
          "url": "https://example.com/media/screenshot.jpg",
          "type": "image"
        }
      ],
      "reviews": []
    }
  }
}
```

#### Create Case
```http
POST /api/cases
```

**Headers**:
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body**:
```json
{
  "slug": "new-case",
  "projectTitle": "New Project",
  "clientName": "New Client",
  "industry": "Technology",
  "summary": "Project summary",
  "challenge": "Challenge description",
  "solution": "Solution description",
  "results": "Results achieved",
  "metrics": {
    "performance": "+25%"
  },
  "category": "WEB_DEVELOPMENT",
  "serviceId": "service_id",
  "heroImageUrl": "https://example.com/hero.jpg",
  "videoUrl": "https://example.com/video.mp4",
  "published": true,
  "mediaIds": ["media_id_1", "media_id_2"]
}
```

#### Update Case
```http
PUT /api/cases/{id}
```

#### Delete Case
```http
DELETE /api/cases/{id}
```

### Reviews

#### Get All Reviews
```http
GET /api/reviews
```

**Query Parameters**:
- `published` - Filter by published status (`true`/`false`)
- `featured` - Filter by featured status (`true`/`false`)
- `type` - Filter by type (`TEXT`, `VIDEO`)
- `rating` - Filter by rating (1-5)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response**:
```json
{
  "data": {
    "reviews": [
      {
        "id": "review_id",
        "authorName": "John Doe",
        "company": "Example Company",
        "content": "Great service!",
        "rating": 5,
        "reviewType": "TEXT",
        "videoUrl": "https://example.com/video.mp4",
        "thumbnailUrl": "https://example.com/thumbnail.jpg",
        "isPublished": true,
        "isFeatured": false,
        "createdAt": "2024-01-01T12:00:00Z",
        "updatedAt": "2024-01-01T12:00:00Z"
      }
    ]
  }
}
```

#### Create Review
```http
POST /api/reviews
```

#### Update Review
```http
PUT /api/reviews/{id}
```

#### Delete Review
```http
DELETE /api/reviews/{id}
```

### Contact

#### Submit Contact Form
```http
POST /api/contact
```

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "company": "Example Company",
  "message": "I'm interested in your services",
  "serviceInterest": "WEB_DEVELOPMENT",
  "recaptchaToken": "recaptcha_token_here"
}
```

**Response**:
```json
{
  "data": {
    "status": "queued",
    "contactRequestId": "contact_request_id",
    "leadId": "bitrix_lead_id"
  }
}
```

### Banners

#### Get Active Banners
```http
GET /api/banners
```

**Response**:
```json
{
  "data": {
    "banners": [
      {
        "id": "banner_id",
        "title": "Main Banner",
        "subtitle": "Contact us for more information",
        "imageUrl": "https://example.com/banner.jpg",
        "mobileImageUrl": "https://example.com/banner-mobile.jpg",
        "buttonText": "Contact Us",
        "buttonUrl": "/contact",
        "isActive": true,
        "order": 1,
        "startDate": "2024-01-01T00:00:00Z",
        "endDate": "2024-12-31T23:59:59Z"
      }
    ]
  }
}
```

### Settings

#### Get Public Settings
```http
GET /api/settings/public
```

**Response**:
```json
{
  "data": {
    "company": {
      "name": "TB Group",
      "description": "Technology solutions company",
      "address": "123 Street, City, Country",
      "phone": "+1234567890",
      "email": "info@tb-group.kz",
      "website": "https://tb-group.kz"
    },
    "social": {
      "facebook": "https://facebook.com/tbgroup",
      "linkedin": "https://linkedin.com/company/tbgroup",
      "instagram": "https://instagram.com/tbgroup"
    },
    "analytics": {
      "googleAnalyticsId": "GA_MEASUREMENT_ID",
      "yandexMetricaId": "YANDEX_COUNTER_ID"
    }
  }
}
```

#### Get All Settings (Admin)
```http
GET /api/settings
```

**Headers**:
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Update Settings
```http
PUT /api/settings
```

**Headers**:
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

### Media Management

#### Upload File
```http
POST /api/uploads
```

**Headers**:
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data
```

**Request Body**:
```
file: [binary file data]
```

**Response**:
```json
{
  "data": {
    "id": "media_id",
    "filename": "uploaded_file.jpg",
    "originalName": "original_name.jpg",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "url": "https://example.com/uploads/uploaded_file.jpg",
    "type": "image"
  }
}
```

#### Get Media Files
```http
GET /api/media
```

**Query Parameters**:
- `type` - Filter by type (`image`, `video`, `document`)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

### Analytics

#### Get Analytics Dashboard
```http
GET /api/analytics/dashboard
```

**Query Parameters**:
- `days` - Number of days to analyze (default: 30)

**Response**:
```json
{
  "data": {
    "period": "Last 30 days",
    "metrics": {
      "totalEvents": 1500,
      "totalPageViews": 5000,
      "totalConversions": 25,
      "conversionRate": 0.5
    },
    "topPages": [
      {
        "url": "/services/web-development",
        "views": 500
      }
    ],
    "funnel": [
      {
        "event": "service_view",
        "count": 100
      },
      {
        "event": "contact_form_submit",
        "count": 25
      }
    ]
  }
}
```

#### Track Custom Event
```http
POST /api/analytics/events
```

**Request Body**:
```json
{
  "event": "button_click",
  "category": "engagement",
  "action": "cta_button",
  "label": "contact_form",
  "value": 1,
  "url": "https://tb-group.kz/contact"
}
```

#### Get Analytics Data
```http
GET /api/analytics/data
```

**Query Parameters**:
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)
- `eventCategory` - Filter by event category

### Email Management

#### Get Email Statistics
```http
GET /api/email/stats
```

**Headers**:
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response**:
```json
{
  "data": {
    "total": 100,
    "sent": 95,
    "failed": 5,
    "successRate": 95,
    "byType": {
      "contact_request": 80,
      "admin_alert": 15,
      "test": 5
    },
    "byProvider": {
      "primary": 90,
      "backup": 5
    }
  }
}
```

#### Get Email Logs
```http
GET /api/email/logs
```

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `status` - Filter by status (`SENT`, `FAILED`, `PENDING`)
- `type` - Filter by email type

#### Test Email Template
```http
POST /api/email/test
```

**Headers**:
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body**:
```json
{
  "templateId": "contact_request",
  "to": "test@example.com",
  "data": {
    "fullName": "Test User",
    "email": "test@example.com",
    "message": "Test message"
  }
}
```

#### Resend Email
```http
POST /api/email/resend
```

### Cache Management

#### Get Cache Status
```http
GET /api/cache/status
```

**Response**:
```json
{
  "data": {
    "enabled": true,
    "connected": true,
    "url": "redis://localhost:6379"
  }
}
```

#### Get Cache Value
```http
GET /api/cache/{key}
```

#### Set Cache Value
```http
POST /api/cache/{key}
```

**Request Body**:
```json
{
  "value": {
    "some": "data"
  },
  "ttl": 3600
}
```

#### Invalidate Cache
```http
POST /api/cache/invalidate
```

**Request Body**:
```json
{
  "pattern": "services:*"
}
```

### Backup Management

#### Get Backup Status
```http
GET /api/cache/backup/status
```

#### Create Backup
```http
POST /api/cache/backup/create
```

**Request Body**:
```json
{
  "type": "full"
}
```

#### List Backups
```http
GET /api/cache/backup/list
```

#### Restore Backup
```http
POST /api/cache/backup/restore
```

**Request Body**:
```json
{
  "backupPath": "/backups/backup-full-2024-01-01.sql"
}
```

### Health Check

#### System Health
```http
GET /health
```

**Response**:
```json
{
  "ok": true
}
```

## Rate Limiting

- **Global Limit**: 120 requests per minute
- **Contact Form**: 5 requests per minute
- **Authentication**: 10 requests per minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 115
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Bitrix24 Integration

The system automatically creates leads in Bitrix24 when contact forms are submitted. The Bitrix24 integration can be configured through environment variables.

### Email Notifications

Email notifications are automatically sent for:
- New contact form submissions
- System alerts and errors
- Admin notifications

Email configuration is handled through environment variables and can be managed through the admin panel.

## SDK Examples

### JavaScript/TypeScript

```typescript
class TBGroupAPI {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    this.accessToken = data.data.tokens.accessToken;
    return data.data;
  }

  async getServices() {
    const response = await this.authenticatedFetch('/api/services');
    return response.json();
  }

  async submitContact(formData: ContactFormData) {
    const response = await fetch(`${this.baseURL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
      },
      body: JSON.stringify(formData),
    });

    return response.json();
  }

  private async authenticatedFetch(endpoint: string, options: RequestInit = {}) {
    return fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
        ...options.headers,
      },
    });
  }
}

interface ContactFormData {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  serviceInterest?: string;
  recaptchaToken: string;
}

// Usage
const api = new TBGroupAPI('https://api.tb-group.kz');
await api.login('admin@example.com', 'password');
const services = await api.getServices();
```

### Python

```python
import requests
from typing import Dict, Any

class TBGroupAPI:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.access_token = None
        self.session = requests.Session()

    def login(self, email: str, password: str) -> Dict[str, Any]:
        response = self.session.post(
            f"{self.base_url}/api/auth/login",
            json={"email": email, "password": password}
        )
        data = response.json()
        self.access_token = data["data"]["tokens"]["accessToken"]
        return data["data"]

    def get_services(self) -> Dict[str, Any]:
        response = self.session.get(
            f"{self.base_url}/api/services",
            headers=self._get_headers()
        )
        return response.json()

    def submit_contact(self, form_data: Dict[str, Any]) -> Dict[str, Any]:
        response = self.session.post(
            f"{self.base_url}/api/contact",
            json=form_data,
            headers=self._get_headers()
        )
        return response.json()

    def _get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        return headers

# Usage
api = TBGroupAPI("https://api.tb-group.kz")
api.login("admin@example.com", "password")
services = api.get_services()
```

## Support

For API support and documentation updates, please:

1. Check this documentation first
2. Review the GitHub repository for issues
3. Create a new issue with detailed information
4. Include request/response examples and error logs

---

This API documentation covers all available endpoints in the TB Group Base Stack. For more specific usage examples or integration help, please refer to the implementation examples or contact the development team.