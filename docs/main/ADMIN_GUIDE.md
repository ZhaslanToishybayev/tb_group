# 👨‍💼 Admin Panel User Guide

**Version**: 1.0
**Last Updated**: 2025-10-31

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [Dashboard](#dashboard)
5. [Content Management](#content-management)
6. [User Management](#user-management)
7. [Settings](#settings)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The TB Group Admin Panel is a React-based interface for managing the corporate website content, user accounts, and system settings. It provides a complete CRUD interface for all website data.

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for API communication
- Valid admin credentials

### Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: TanStack React Query
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form + Zod validation

---

## Getting Started

### Accessing the Admin Panel

1. Navigate to the admin panel URL (typically `/admin` on your domain)
2. You'll be redirected to the login page if not authenticated
3. Enter your admin credentials
4. Click "Sign In" to access the dashboard

### First Login

On first access, you may need to:
- Create your admin account via API bootstrap script
- Verify your email address (if configured)
- Set up 2FA (if enabled)

---

## Authentication

### Login Process

1. **Email/Username**: Enter your registered email
2. **Password**: Enter your secure password
3. **Remember Me**: Check to stay logged in (optional)
4. **Submit**: Click "Sign In" button

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character

### Session Management

- Active sessions are tracked server-side
- Automatic logout after 30 days (configurable)
- Manual logout available in top navigation
- JWT tokens used for API authentication

---

## Dashboard

### Overview

The dashboard provides a quick overview of:
- System status and health
- Recent content changes
- User activity
- Analytics snapshots
- Quick action buttons

### Key Metrics

| Metric | Description | Location |
|--------|-------------|----------|
| **Total Users** | All registered users | Top card |
| **Active Content** | Published content items | Top card |
| **Recent Activity** | Latest admin actions | Activity feed |
| **System Health** | API status, database connectivity | Status indicators |

### Navigation Menu

Located in the left sidebar:
- 🏠 Dashboard
- 📄 Content
  - Services
  - Cases
  - Reviews
  - Banners
- 👥 Users
- 📊 Analytics
- ⚙️ Settings

---

## Content Management

### Services

#### Viewing Services
1. Navigate to **Content → Services**
2. View all services in a table format
3. Use search/filter to find specific services
4. Click on a service to view details

#### Creating a Service
1. Click **"Add Service"** button
2. Fill in required fields:
   - **Title**: Service name (required)
   - **Slug**: URL-friendly identifier (auto-generated)
   - **Description**: Detailed service description
   - **Short Description**: Brief summary for lists
   - **Icon**: Service icon/image
   - **Status**: Draft or Published
3. Add content in the editor:
   - Rich text formatting
   - Image uploads
   - Video embeds
   - Custom HTML (if allowed)
4. Configure SEO settings:
   - Meta title
   - Meta description
   - Keywords
5. Click **"Save Draft"** or **"Publish"**

#### Editing a Service
1. Click on existing service in the list
2. Make changes to any field
3. Changes are auto-saved (if enabled) or click **"Save"**
4. **Preview** button shows how it looks on public site
5. **Unpublish** returns to draft status

#### Deleting a Service
1. Click **"Delete"** button (danger zone)
2. Confirm deletion in modal dialog
3. Service is moved to trash (recoverable for 30 days)
4. **Permanent Delete** removes completely

### Cases

#### Managing Case Studies
1. Navigate to **Content → Cases**
2. View, create, edit, and delete case studies
3. Case study fields:
   - Title
   - Client name
   - Industry
   - Challenge description
   - Solution provided
   - Results/metrics
   - Images/gallery
   - Testimonial quote
   - Related services

#### Case Study Workflow
1. **Create** → Fill basic information
2. **Draft** → Add content and media
3. **Review** → Check all details
4. **Publish** → Make live on website
5. **Archive** → Hide from public (keep data)

### Reviews

#### Review Management
1. Navigate to **Content → Reviews**
2. Manage both text and video reviews

#### Text Reviews
- Customer name
- Company/position
- Rating (1-5 stars)
- Review text
- Profile photo
- Date of review
- Approved status

#### Video Reviews
- All text review fields PLUS:
- Video file upload or URL
- Video thumbnail
- Duration
- Video player settings

#### Moderation Workflow
1. **Pending** → Awaiting review
2. **Approved** → Displayed on website
3. **Rejected** → Not displayed (with reason)
4. **Featured** → Highlighted on homepage

### Banners

#### Banner Types
1. **Hero Banner**: Main page header
2. **Promotional**: Special offers/announcements
3. **Informational**: General messages
4. **Call-to-Action**: Prompt user action

#### Banner Configuration
- Title/headline
- Subtitle/description
- Background image/video
- Button text and link
- Display schedule (start/end dates)
- Target audience
- Priority (controls display order)
- Status (active/inactive)

---

## User Management

### User Roles

#### Admin
- Full system access
- User management
- System settings
- All content management

#### Editor
- Content management
- Cannot manage users
- Limited settings access

#### Viewer
- Read-only access
- Cannot edit content

### Managing Users

#### Creating a User
1. Navigate to **Users → All Users**
2. Click **"Add User"**
3. Fill user details:
   - Name (first and last)
   - Email (unique identifier)
   - Role (Admin/Editor/Viewer)
   - Password (temporary)
4. Click **"Create User"**
5. User receives email with login instructions

#### Editing a User
1. Click on user in the list
2. Update any field except email (unique)
3. Save changes
4. User must re-login if password changed

#### Deactivating a User
1. Click user to edit
2. Set **Status** to "Inactive"
3. User cannot log in
4. Reactivate by setting status back to "Active"

#### Resetting Password
1. User requests reset via login page
2. OR admin clicks **"Reset Password"** in user profile
3. Reset link sent via email
4. Link expires after 1 hour

---

## Settings

### Site Configuration

#### General Settings
- **Site Name**: TB Group
- **Site Description**: Company tagline
- **Logo**: Upload site logo
- **Favicon**: Browser tab icon
- **Timezone**: System timezone
- **Date Format**: Preferred date display
- **Language**: Default language

#### Contact Information
- **Address**: Physical address
- **Phone**: Main phone number
- **Email**: Contact email
- **Business Hours**: Operating schedule

#### SEO Settings
- **Default Meta Title**: Site-wide title
- **Default Meta Description**: Site-wide description
- **Default Keywords**: Site-wide keywords
- **Google Analytics ID**: GA tracking
- **Yandex Metrica ID**: Yandex tracking

### Integration Settings

#### Bitrix24 CRM
1. Navigate to **Settings → Integrations → Bitrix24**
2. Configure:
   - Webhook URL
   - Domain
   - Assigned User ID
   - Lead Category
   - Pipeline Status
   - Custom Fields Mapping
3. Click **"Test Connection"**
4. Save configuration

#### reCAPTCHA
1. Navigate to **Settings → Integrations → reCAPTCHA**
2. Enter site key and secret key
3. Configure validation settings
4. Save configuration

#### Email Settings
1. Navigate to **Settings → Integrations → Email**
2. Configure SMTP:
   - Host
   - Port
   - Security (SSL/TLS)
   - Username
   - Password
   - From address
3. Test email delivery
4. Save configuration

### System Settings

#### Cache Management
1. Navigate to **Settings → System → Cache**
2. View cache statistics
3. Clear cache:
   - User sessions
   - API responses
   - Static assets
   - Full cache

#### Database Backup
1. Navigate to **Settings → System → Backup**
2. View backup status
3. Create manual backup
4. Download backup file
5. Schedule automatic backups

#### Logs
1. Navigate to **Settings → System → Logs**
2. View system logs:
   - Authentication events
   - Content changes
   - API requests
   - Errors and warnings
3. Filter by date, level, or category
4. Export logs for external analysis

---

## Troubleshooting

### Common Issues

#### Can't Log In
**Symptoms**: Login form doesn't submit or shows error
**Solutions**:
1. Check email and password are correct
2. Clear browser cache and cookies
3. Try incognito/private browsing mode
4. Check your account isn't deactivated
5. Contact system administrator

#### Changes Not Saving
**Symptoms**: Form submissions fail or data reverts
**Solutions**:
1. Check internet connection
2. Verify API endpoint is accessible
3. Check for validation errors (shown in red)
4. Try refreshing the page
5. Check browser console for errors

#### Images Not Uploading
**Symptoms**: Upload fails or images don't display
**Solutions**:
1. Check file size (max 5MB typically)
2. Verify file type is allowed (JPG, PNG, WebP)
3. Ensure you have upload permissions
4. Check storage space availability
5. Try compressing the image

#### Page Not Found (404)
**Symptoms**: Admin panel shows 404 error
**Solutions**:
1. Check URL is correct
2. Ensure you're logged in
3. Clear browser cache
4. Try direct navigation from dashboard menu
5. Check if your user role has access

### Getting Help

#### Contact Information
- **Email**: support@tbgroup.kz
- **Phone**: +7 (XXX) XXX-XXXX
- **Support Hours**: Mon-Fri, 9:00-18:00 (UTC+6)

#### Self-Service Resources
- 📖 This user guide
- 🔗 API Documentation: `/docs/api`
- 🎥 Video tutorials (if available)
- ❓ FAQ section

#### Escalation
If you cannot resolve an issue:
1. Document the problem (screenshots, error messages)
2. Note your user role and permissions
3. Describe steps to reproduce
4. Email support with details

---

## Tips & Best Practices

### Content Management
✅ **DO**:
- Save drafts frequently
- Use descriptive titles
- Add alt text to images
- Preview before publishing
- Use consistent formatting

❌ **DON'T**:
- Leave content unpublished indefinitely
- Use special characters in slugs
- Upload oversized images
- Delete content without archiving

### Security
✅ **DO**:
- Log out when finished
- Use strong passwords
- Keep credentials confidential
- Report suspicious activity
- Follow password change policy

❌ **DON'T**:
- Share your login credentials
- Leave the admin panel open unattended
- Click suspicious links
- Bypass security measures

### Performance
✅ **DO**:
- Optimize images before upload
- Use cache management features
- Regularly clean up unused content
- Monitor system performance
- Archive old content

❌ **DON'T**:
- Overcrowd with unnecessary content
- Ignore performance warnings
- Leave cache unchecked indefinitely
- Create too many user accounts

---

## Appendix

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Quick search | `Ctrl + K` |
| Save | `Ctrl + S` |
| New content | `Ctrl + N` |
| Refresh | `Ctrl + R` |
| Logout | `Ctrl + Shift + L` |

### File Upload Limits

| Type | Limit |
|------|-------|
| Images (JPG, PNG, WebP) | 5 MB |
| Videos | 100 MB |
| Documents (PDF, DOC) | 10 MB |

### Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

**End of Admin Guide**

*For technical documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md) and [DEPLOYMENT.md](DEPLOYMENT.md)*
