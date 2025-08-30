# US TIN Matching Service Guide

## Overview

The IRS TIN Matching service is a unified API that validates ALL US tax identification numbers:
- **EIN** (Employer Identification Number)
- **SSN** (Social Security Number)  
- **ITIN** (Individual Taxpayer Identification Number)

This single service replaces the need for multiple verification systems, providing one consistent interface for all US tax ID verification.

## Why TIN Matching?

Instead of using separate services (SSNVS for SSN, separate EIN verification), the IRS TIN Matching service:
- ✅ Verifies all US tax ID types in one API
- ✅ Provides consistent response formats
- ✅ Simplifies integration and maintenance
- ✅ Reduces compliance complexity
- ✅ Offers both real-time and batch processing

## Quick Start

### 1. Check Eligibility

You can register for TIN Matching if you are:
- Tax professionals (CPAs, EAs, attorneys)
- Financial institutions
- Businesses with legitimate need for TIN verification
- Payers who file information returns

### 2. Register for IRS e-Services

1. **Visit IRS e-Services Portal**
   ```
   https://www.irs.gov/tax-professionals/taxpayer-identification-number-tin-matching
   ```

2. **Create Account**
   - Click "Register for e-Services"
   - Provide your SSN or ITIN
   - Enter business information
   - Create secure credentials

3. **Verify Identity**
   - Complete online verification (instant)
   - OR receive verification code by mail (7-10 days)

4. **Request TIN Matching Access**
   - Log into e-Services
   - Navigate to "Application to Participate"
   - Select "TIN Matching"
   - Provide business justification
   - Submit application

5. **Approval & Setup** (5-45 days)
   - IRS reviews application
   - Upon approval, receive:
     - API documentation
     - Digital certificates
     - Test environment access
     - Production credentials

## Implementation

### Basic Setup

```javascript
// .env configuration
REQUESTER_EIN=12-3456789
REQUESTER_NAME=Your Company Name
IRS_CERT_PATH=/path/to/certificate.pem
IRS_KEY_PATH=/path/to/private-key.pem
IRS_CA_PATH=/path/to/ca-bundle.pem
```

### Using the Validator

```javascript
const validateTaxId = require('corporate-taxid-checker-js');

// Validate any US tax ID
async function validateUSNumber(taxId) {
    // Offline validation (always available)
    const result = await validateTaxId('US', taxId, false);
    console.log('Format valid:', result.isValid);
    
    // Online TIN Matching (requires registration)
    const verified = await validateTaxId('US', taxId, true);
    console.log('TIN verified:', verified.onlineCheck);
    
    return verified;
}

// Examples
await validateUSNumber('12-3456789');   // EIN
await validateUSNumber('234-56-7890');  // SSN
await validateUSNumber('912-70-1234');  // ITIN
```

### API Request Format

The TIN Matching API accepts both JSON and XML. Here's the JSON format:

```json
{
    "tinMatchingRequest": {
        "tin": "123456789",
        "tinType": "EIN",
        "requesterInfo": {
            "requesterTIN": "987654321",
            "requesterName": "Your Company"
        },
        "recipientInfo": {
            "name": "Business Name (for EIN) or Individual Name (for SSN/ITIN)"
        }
    }
}
```

### Response Codes

The API returns match codes indicating verification status:

| Code | Meaning | Action Required |
|------|---------|----------------|
| 0 | TIN and Name match | ✅ Verification successful |
| 1 | TIN matches, Name doesn't | ⚠️ Verify name spelling |
| 2 | TIN not currently issued | ❌ Invalid TIN |
| 3 | TIN/Name combo doesn't match | ❌ Check both TIN and name |
| 4 | Invalid TIN format | ❌ Check number format |
| 5 | Duplicate request | ⚠️ Already verified recently |
| 6 | Service temporarily unavailable | 🔄 Retry later |

## Advanced Implementation

### With Certificate Authentication

```javascript
const https = require('https');
const fs = require('fs');

async function verifyTIN(tin, name) {
    const requestData = {
        tinMatchingRequest: {
            tin: tin.replace(/[-\s]/g, ''),
            tinType: determineTINType(tin),
            requesterInfo: {
                requesterTIN: process.env.REQUESTER_EIN,
                requesterName: process.env.REQUESTER_NAME
            },
            recipientInfo: {
                name: name
            }
        }
    };
    
    const options = {
        hostname: 'la1.www4.irs.gov',
        path: '/e-services/preparer/v1/api/tinmatching',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        cert: fs.readFileSync(process.env.IRS_CERT_PATH),
        key: fs.readFileSync(process.env.IRS_KEY_PATH),
        ca: fs.readFileSync(process.env.IRS_CA_PATH)
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const response = JSON.parse(data);
                resolve(response.tinMatchingResponse.matchCode === '0');
            });
        });
        
        req.on('error', reject);
        req.write(JSON.stringify(requestData));
        req.end();
    });
}
```

### Batch Processing

For high-volume verification:

```javascript
async function batchVerifyTINs(tins) {
    const results = [];
    const batchSize = 100; // Process in batches
    
    for (let i = 0; i < tins.length; i += batchSize) {
        const batch = tins.slice(i, i + batchSize);
        
        // Create batch request
        const batchRequest = {
            tinMatchingBatchRequest: {
                requests: batch.map(item => ({
                    tin: item.tin,
                    tinType: determineTINType(item.tin),
                    name: item.name
                })),
                requesterInfo: {
                    requesterTIN: process.env.REQUESTER_EIN,
                    requesterName: process.env.REQUESTER_NAME
                }
            }
        };
        
        // Submit batch (implementation depends on IRS batch API)
        const batchResults = await submitBatch(batchRequest);
        results.push(...batchResults);
        
        // Respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
}
```

## Rate Limits & Best Practices

### Limits
- **Real-time**: 999 requests per day
- **Batch**: 100,000 TINs per file
- **Response time**: Usually < 2 seconds

### Best Practices

1. **Cache Results**
   ```javascript
   const cache = new Map();
   const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
   
   function getCachedResult(tin) {
       const cached = cache.get(tin);
       if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
           return cached.result;
       }
       return null;
   }
   ```

2. **Implement Retry Logic**
   ```javascript
   async function verifyWithRetry(tin, maxRetries = 3) {
       for (let i = 0; i < maxRetries; i++) {
           try {
               return await verifyTIN(tin);
           } catch (error) {
               if (i === maxRetries - 1) throw error;
               await new Promise(r => setTimeout(r, 1000 * (i + 1)));
           }
       }
   }
   ```

3. **Audit Logging**
   ```javascript
   function logVerification(tin, result, userId) {
       const log = {
           timestamp: new Date().toISOString(),
           tin: tin.substring(0, 3) + '****', // Mask for security
           result: result,
           requestedBy: userId,
           ip: req.ip
       };
       fs.appendFileSync('tin_audit.log', JSON.stringify(log) + '\n');
   }
   ```

## Testing

### Test TINs

Use these for development (won't verify as valid):

```javascript
// Test EINs
const testEINs = [
    '00-0000001',
    '00-0000002',
    '00-0000099'
];

// Test SSNs  
const testSSNs = [
    '900-00-0001',
    '900-00-0002',
    '900-00-0100'
];

// Test ITINs (use same range as SSN)
const testITINs = [
    '900-70-0001',
    '900-88-0002'
];
```

## Compliance Requirements

### Required Documentation
- Maintain audit logs of all verifications
- Document business purpose for each verification
- Keep records for 3-7 years (varies by use case)

### Security Requirements
- Encrypt TINs at rest and in transit
- Implement access controls
- Regular security audits
- Certificate rotation every 1-2 years

### Usage Restrictions
- Only verify TINs for legitimate business purposes
- Must have authorization from TIN holder (for SSN/ITIN)
- Cannot use for identity theft or fraud
- Subject to IRS audits and penalties for misuse

## Troubleshooting

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| Certificate error | Expired or invalid cert | Renew certificates via e-Services |
| Authentication failed | Invalid credentials | Verify EIN and name match registration |
| Rate limit exceeded | Too many requests | Implement queuing and caching |
| Invalid TIN format | Formatting issue | Remove spaces/hyphens, ensure 9 digits |
| Service unavailable | IRS maintenance | Check IRS service status page |

### Getting Help

**IRS e-Services Support**
- Phone: 1-866-255-0654
- Hours: Monday-Friday, 7:30am-7pm ET
- Email: e-help@irs.gov

**Technical Documentation**
- TIN Matching: https://www.irs.gov/tax-professionals/taxpayer-identification-number-tin-matching
- TIN Matching: Search "TIN Matching" on IRS.gov

## Summary

The IRS TIN Matching service provides a single, unified way to verify all US tax IDs (EIN, SSN, ITIN). By using this one service instead of multiple systems, you can:

- Simplify your integration
- Reduce compliance complexity
- Verify any US tax ID type
- Maintain consistent audit trails
- Meet IRS requirements efficiently

Remember: The offline validation in this library works immediately without registration, catching format errors and invalid patterns. Online verification through TIN Matching is only needed when you must confirm the TIN actually exists in IRS records.