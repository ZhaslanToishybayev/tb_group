# TB Group Base Stack - API Usage Examples

## Quick Start

### Base URL
```
Development: http://localhost:4000
Production:  https://api.tbgroup.kz
```

### Authentication

Get JWT token:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'
```

Use token for authenticated requests:
```bash
curl http://localhost:4000/api/services \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Common Use Cases

### 1. Contact Form Submission

**Endpoint**: `POST /api/contact`

```bash
curl -X POST http://localhost:4000/api/contact \
  -H "Content-Type: application/json" \
  -H "recaptcha-token: YOUR_RECAPTCHA_TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+7 (777) 123-45-67",
    "company": "ACME Corp",
    "message": "I am interested in your services"
  }'
```

**JavaScript/TypeScript**:
```typescript
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+7 (777) 123-45-67',
    company: 'ACME Corp',
    message: 'I am interested in your services'
  }),
});

const data = await response.json();
console.log(data);
```

### 2. Fetch Services

**Endpoint**: `GET /api/services`

```bash
# All services
curl http://localhost:4000/api/services

# With authentication
curl http://localhost:4000/api/services \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript**:
```typescript
// React/Next.js
const [services, setServices] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/services')
    .then(res => res.json())
    .then(data => {
      setServices(data.data.services);
      setLoading(false);
    });
}, []);
```

### 3. Fetch Case Studies with Filtering

**Endpoint**: `GET /api/cases`

```bash
# All cases
curl http://localhost:4000/api/cases

# Filter by category
curl "http://localhost:4000/api/cases?category=bitrix24"

# Filter by search term
curl "http://localhost:4000/api/cases?search=crm"

# Pagination
curl "http://localhost:4000/api/cases?page=1&limit=10"
```

**JavaScript**:
```typescript
const fetchCases = async (category?: string, page: number = 1) => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  params.append('page', page.toString());
  
  const response = await fetch(`/api/cases?${params}`);
  const data = await response.json();
  return data.data;
};
```

### 4. Fetch Reviews

**Endpoint**: `GET /api/reviews`

```bash
# All reviews
curl http://localhost:4000/api/reviews

# With pagination
curl "http://localhost:4000/api/reviews?page=1&limit=6"

# Video reviews only
curl "http://localhost:4000/api/reviews?type=video"
```

**React Component**:
```tsx
import { useState, useEffect } from 'react';

interface Review {
  id: string;
  author: string;
  content: string;
  rating: number;
  videoUrl?: string;
}

export const ReviewsList = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  
  useEffect(() => {
    fetch('/api/reviews?page=1&limit=6')
      .then(res => res.json())
      .then(data => setReviews(data.data.reviews));
  }, []);
  
  return (
    <div>
      {reviews.map(review => (
        <div key={review.id}>
          <h3>{review.author}</h3>
          <p>{review.content}</p>
          {review.videoUrl && (
            <video controls src={review.videoUrl} />
          )}
        </div>
      ))}
    </div>
  );
};
```

### 5. Admin Operations

#### Create Service (Admin only)

**Endpoint**: `POST /api/admin/services`

```bash
curl -X POST http://localhost:4000/api/admin/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Bitrix24 CRM",
    "description": "Complete CRM solution",
    "icon": "crm-icon",
    "features": ["Leads", "Deals", "Tasks"]
  }'
```

#### Update Service

**Endpoint**: `PUT /api/admin/services/:id`

```bash
curl -X PUT http://localhost:4000/api/admin/services/123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Title",
    "description": "Updated description"
  }'
```

#### Delete Service

**Endpoint**: `DELETE /api/admin/services/:id`

```bash
curl -X DELETE http://localhost:4000/api/admin/services/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. AI Analytics (Advanced)

#### Generate AI Insights

**Endpoint**: `POST /api/analytics-ai/insights/generate`

```bash
curl -X POST http://localhost:4000/api/analytics-ai/insights/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "timeRange": "last_30_days",
    "metrics": ["visits", "conversions", "bounce_rate"]
  }'
```

#### Create A/B Test

**Endpoint**: `POST /api/analytics-ai/ab-test/create`

```bash
curl -X POST http://localhost:4000/api/analytics-ai/ab-test/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Homepage CTA Test",
    "variants": [
      {"name": "Control", "url": "/"},
      {"name": "Variant A", "url": "/?cta=primary"}
    ],
    "trafficSplit": 50
  }'
```

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Email is required"],
      "name": ["Name must be at least 2 characters"]
    }
  }
}
```

### Handle Errors in JavaScript

```typescript
try {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error.message);
  }
  
  console.log('Success:', data);
} catch (error) {
  console.error('Error:', error.message);
  // Show error to user
}
```

## Rate Limiting

API is rate-limited to 120 requests per minute per IP.

**Response headers**:
```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 119
X-RateLimit-Reset: 1635724800
```

## Caching

API responses are cached using Redis. Cache headers:

```
Cache-Control: public, max-age=3600
X-Cache-Status: HIT
```

### Bypass Cache

For real-time data, add cache control header:

```bash
curl http://localhost:4000/api/services \
  -H "Cache-Control: no-cache"
```

## Best Practices

### 1. Always Validate Input

```typescript
import { z } from 'zod';

const ContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

const validateContact = (data: unknown) => {
  return ContactSchema.parse(data);
};
```

### 2. Use Proper Error Handling

```typescript
try {
  await apiCall();
} catch (error) {
  if (error.status === 401) {
    // Redirect to login
    window.location.href = '/admin/login';
  } else {
    // Show error message
    showNotification(error.message, 'error');
  }
}
```

### 3. Implement Pagination

```typescript
const loadMore = async (page: number) => {
  const response = await fetch(`/api/cases?page=${page}&limit=10`);
  const data = await response.json();
  setCases(prev => [...prev, ...data.data.cases]);
};
```

### 4. Use TypeScript Types

```typescript
// types/api.ts
export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
```

## SDK Example (TypeScript)

```typescript
// sdk/tbgroup-api.ts
export class TBGroupAPI {
  private baseUrl: string;
  private token: string | null = null;
  
  constructor(baseUrl: string = 'http://localhost:4000') {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('token');
  }
  
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };
    
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API Error');
    }
    
    return data;
  }
  
  async getServices() {
    return this.request<{ services: Service[] }>('/api/services');
  }
  
  async submitContact(contact: ContactFormData) {
    return this.request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  }
}

// Usage
const api = new TBGroupAPI();
api.setToken('your-jwt-token');
const services = await api.getServices();
```

---

**Need more examples?**
- Check [API Documentation](../../API_DOCUMENTATION.md)
- See [Admin Guide](./ADMIN_GUIDE.md)
- Review [Integration Overview](../integration-overview.md)
