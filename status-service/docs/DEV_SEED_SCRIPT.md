# Dev Seed Script - Database Seeding for Development

## Overview

The `dev:seed` script populates the SQLite database with sample incidents for development and testing purposes. It's designed to quickly reset the database to a known state with realistic test data.

## Quick Start

```bash
# Navigate to status-service directory
cd status-service

# Run the seed script
npm run dev:seed
```

## What It Does

1. **Clears Existing Data**
   - Removes all existing incidents from the database
   - Shows count of cleared incidents

2. **Creates Sample Incidents**
   - 6 realistic incident scenarios
   - Mix of statuses: investigating, identified, monitoring, resolved
   - Mix of severities: low, medium, high, critical

3. **Displays Statistics**
   - Total incident count
   - Breakdown by status
   - Breakdown by severity

4. **Lists All Incidents**
   - Shows each incident with ID, severity, status
   - Displays title and creation time
   - Shows resolution time for resolved incidents

## Sample Data

The script creates 6 incidents representing common real-world scenarios:

### 1. API Performance Degradation
- **Status**: investigating
- **Severity**: high
- **Description**: Increased latency on main API endpoints

### 2. Database Connection Pool Exhaustion
- **Status**: identified
- **Severity**: critical
- **Description**: Connection pool reached maximum capacity

### 3. CDN Cache Miss Rate Spike
- **Status**: monitoring
- **Severity**: medium
- **Description**: Cache miss rate increased to 45%

### 4. Email Delivery Delays
- **Status**: resolved
- **Severity**: low
- **Description**: Transactional emails delayed by 15 minutes

### 5. Payment Gateway Timeout
- **Status**: investigating
- **Severity**: critical
- **Description**: 2% of Stripe transactions failing

### 6. Search Service Slow Response
- **Status**: monitoring
- **Severity**: high
- **Description**: 5-10 second delays for search results

## Sample Output

```
🌱 Seeding incident database...

Clearing existing incidents...
✅ Cleared 6 existing incidents

Creating sample incidents...

✅ Created incident #10: API Performance Degradation
✅ Created incident #11: Database Connection Pool Exhaustion
✅ Created incident #12: CDN Cache Miss Rate Spike
✅ Created incident #13: Email Delivery Delays
✅ Created incident #14: Payment Gateway Timeout
✅ Created incident #15: Search Service Slow Response

📊 Database Statistics:
Total incidents: 6

By Status:
  investigating: 2
  identified: 1
  monitoring: 2
  resolved: 1

By Severity:
  low: 1
  medium: 1
  high: 2
  critical: 2

📋 All Incidents:
  #15 [HIGH] MONITORING
     Search Service Slow Response
     Created: 2025-10-31T20:25:08.579Z

  #14 [CRITICAL] INVESTIGATING
     Payment Gateway Timeout
     Created: 2025-10-31T20:25:08.578Z

  #13 [LOW] RESOLVED
     Email Delivery Delays
     Created: 2025-10-31T20:25:08.576Z

  #12 [MEDIUM] MONITORING
     CDN Cache Miss Rate Spike
     Created: 2025-10-31T20:25:08.575Z

  #11 [CRITICAL] IDENTIFIED
     Database Connection Pool Exhaustion
     Created: 2025-10-31T20:25:08.574Z

  #10 [HIGH] INVESTIGATING
     API Performance Degradation
     Created: 2025-10-31T20:25:08.572Z

✨ Database seeded successfully!

💡 Tip: Start the server with: npm run dev
```

## Use Cases

### 1. Development Testing
Quickly populate the database with realistic data for testing features:
```bash
npm run dev:seed
npm run dev  # Start server with test data
```

### 2. Reset Database
Reset the database to a clean state:
```bash
npm run dev:seed
```

### 3. Demo Preparation
Prepare demo data before showcasing the application:
```bash
npm run dev:seed
```

### 4. Testing API Endpoints
Test API endpoints with known data:
```bash
npm run dev:seed
# Now test API endpoints
curl http://localhost:3000/api/incidents
```

## Configuration

### Script Location
`src/scripts/seed.ts`

### NPM Script
Defined in `package.json`:
```json
{
  "scripts": {
    "dev:seed": "tsx src/scripts/seed.ts"
  }
}
```

### Dependencies
- `tsx` - TypeScript execution
- `../services/incidents.js` - Incident service

## Database Schema

The seeded incidents follow the database schema:

```typescript
interface Incident {
  id?: number;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at?: string;
  updated_at?: string;
  resolved_at?: string | null;
}
```

## Statistics Breakdown

After seeding, the database contains:

| Metric | Value |
|--------|-------|
| Total Incidents | 6 |
| Investigating | 2 (33%) |
| Identified | 1 (17%) |
| Monitoring | 2 (33%) |
| Resolved | 1 (17%) |
| Low Severity | 1 (17%) |
| Medium Severity | 1 (17%) |
| High Severity | 2 (33%) |
| Critical Severity | 2 (33%) |

## Customization

### Modifying Sample Data

Edit `src/scripts/seed.ts` to change the sample incidents:

```typescript
const sampleIncidents = [
  {
    title: 'Your Incident Title',
    description: 'Detailed description...',
    status: 'investigating' as const,
    severity: 'high' as const,
  },
  // Add more incidents...
];
```

### Adding More Incidents

Simply add more objects to the `sampleIncidents` array:

```typescript
const sampleIncidents = [
  // Existing incidents...
  {
    title: 'Custom Incident',
    description: 'Description here',
    status: 'monitoring' as const,
    severity: 'medium' as const,
  },
];
```

### Changing Incidents Count

Modify the array to have more or fewer incidents:
```typescript
// For 10 incidents
const sampleIncidents = [
  // ... 10 incident objects
];
```

## Error Handling

The script includes error handling:

```typescript
seedDatabase().catch((error) => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});
```

If seeding fails:
1. Error message is displayed
2. Script exits with code 1
3. Database remains in previous state

## Integration

### With Other Scripts

Combine with other development scripts:

```bash
# Reset and start development server
npm run dev:seed && npm run dev

# Seed, run tests
npm run dev:seed && npm test

# Seed and build
npm run dev:seed && npm run build
```

### With Docker

Use in Docker container:

```dockerfile
# In Dockerfile
RUN npm run dev:seed
CMD ["npm", "run", "dev"]
```

### With CI/CD

Automate seeding in CI:

```yaml
# .github/workflows/test.yml
- name: Seed database
  run: npm run dev:seed
- name: Run tests
  run: npm test
```

## Best Practices

### 1. Run Before Development
Always seed the database at the start of a development session:
```bash
npm run dev:seed
```

### 2. Clear State
The script clears all existing data, so use it when you want a fresh start.

### 3. Verify Data
After seeding, verify the data:
```bash
npm run dev:seed
curl http://localhost:3000/api/incidents
```

### 4. Customize as Needed
Modify the sample incidents to match your testing needs.

## Troubleshooting

### Issue: Script Fails to Run

**Symptom**: `npm run dev:seed` command not found

**Solution**:
```bash
# Ensure you're in status-service directory
cd status-service

# Check if script exists
ls src/scripts/seed.ts

# Verify package.json has the script
grep dev:seed package.json
```

### Issue: Database Locked

**Symptom**: Error about database being locked

**Solution**:
```bash
# Stop any running servers
npm run dev:seed
```

### Issue: Import Errors

**Symptom**: Module not found errors

**Solution**:
```bash
# Install dependencies
npm install

# Check TypeScript compilation
npx tsc --noEmit
```

### Issue: No Incidents Created

**Symptom**: Script runs but creates no incidents

**Solution**:
```bash
# Check service initialization
# Review logs for errors
# Verify database file permissions
```

## Performance

- **Execution Time**: ~1-2 seconds
- **Database Operations**: 7 (1 clear + 6 creates)
- **Memory Usage**: Minimal (< 10MB)
- **Network I/O**: None

## Security Notes

- Development-only script
- Should not be used in production
- Clears all existing data
- No authentication required

## Maintenance

### Regular Updates

Update sample incidents periodically:
- Add new realistic scenarios
- Update descriptions to match current issues
- Remove outdated incident types

### Version Control

The seed script should be version controlled:
```bash
git add src/scripts/seed.ts
git commit -m "Update seed script with new test data"
```

## Related Scripts

- `npm run dev` - Start development server
- `npm run test` - Run test suite
- `npm run demo` - Run demo script
- `npm run build` - Build for production

## Support

For issues or questions:
1. Check the error message
2. Review the seed.ts source code
3. Verify database permissions
4. Check service logs

## Summary

The `dev:seed` script provides:
✅ Quick database seeding
✅ Realistic sample data
✅ Comprehensive statistics
✅ Easy customization
✅ Error handling
✅ Development-friendly output

It's an essential tool for development, testing, and demonstration purposes.
