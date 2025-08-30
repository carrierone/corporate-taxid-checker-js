# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a JavaScript library for validating tax identification numbers (TINs) worldwide. The library provides three levels of validation:
1. **Regex validation** - format checking using regular expressions
2. **Checksum validation** - mathematical validation for supported countries
3. **Online validation** - direct verification with tax authorities (EU countries, Australia, and US via IRS TIN Matching)

## Build Commands

- `npm test` - Run Jest tests
- `npm run build` - Build both library and distribution versions
- `npm run build:lib` - Build Node.js library version using webpack.node.cjs
- `npm run build:dist` - Build browser distribution version using webpack.browser.cjs

## Architecture

### Core Structure

- **`src/index.js`** - Main entry point with `validateTaxId()` function
- **`src/validators/`** - Country-specific validation modules (e.g., `IN.js`, `DE.js`)
- **`data/data.json`** - Tax ID validation rules for all supported countries
- **`src/data.compressed`** - Compressed version of validation data using jsonpack

### Key Components

1. **Main Validator (`src/index.js`)**:
   - Loads compressed country data using jsonpack
   - Matches country code to find validation rules
   - Applies regex, checksum, and online validation as needed
   - Returns detailed validation results

2. **Country Validators (`src/validators/`)**:
   - Each file exports validation functions named `validate_{type}` (e.g., `validate_in_gst`)
   - Some include `online_check` functions for web-based validation
   - Follow naming convention: two-letter country code (e.g., `IN.js`, `DE.js`)

3. **Data Structure**:
   - Country data includes regex patterns, checksum requirements, and online check availability
   - Each country entry specifies entity types (GST, PAN, VAT, etc.)

### Build System

- **Webpack configuration**: Separate configs for Node.js (`webpack.node.cjs`) and browser (`webpack.browser.cjs`)
- **Babel**: Transforms ES6+ code for compatibility
- **Raw loader**: Handles compressed data files
- **Jest**: Testing framework with Babel transformation

### Testing

Tests are located in `tests/` directory. The Jest configuration excludes compressed data files from transformation.

## Development Notes

- The library supports both CommonJS and browser environments
- Compressed data reduces bundle size significantly
- Country validators are dynamically loaded only when needed
- Debug mode provides detailed logging for troubleshooting validation issues

## US Tax ID Validation

The US validator (`src/validators/US.js`) provides comprehensive validation for three types of US tax identification numbers, following official federal government specifications (updated 2025):

### Supported TIN Types

1. **EIN (Employer Identification Number)**
   - Format: XX-XXXXXXX (9 digits)
   - Valid prefixes based on IRS campus assignments (2025)
   - Source: https://www.irs.gov/businesses/small-businesses-self-employed/how-eins-are-assigned-and-valid-ein-prefixes
   - **Note**: Prefixes 07, 08, 09 are NOT valid per official IRS documentation

2. **SSN (Social Security Number)**
   - Format: XXX-XX-XXXX (9 digits)
   - Validates area codes, group numbers, and serial numbers
   - Accounts for 2011 randomization changes
   - Sources: 
     - https://www.ssa.gov/policy/docs/ssb/v69n2/v69n2p55.html
     - https://www.ssa.gov/employer/randomization.html

3. **ITIN (Individual Taxpayer Identification Number)**
   - Format: 9XX-XX-XXXX (9 digits)
   - Valid group ranges: 50-65, 70-88, 90-92, 94-99
   - Source: https://www.irs.gov/tin/itin/individual-taxpayer-identification-number-itin

### Validation Methods

- **Offline validation**: Comprehensive format and structural checking based on official rules
- **Online validation**: IRS TIN Matching API integration (requires e-Services registration)
- **TIN type detection**: `determineTINType()` helper function for API routing
- **Edge case handling**: Comprehensive testing for null inputs, Unicode characters, and boundary conditions

### Official Sources Documentation

All validation rules are based on current federal government specifications:
- IRS EIN campus prefix assignments and valid ranges
- SSA area code assignments and invalid patterns  
- IRS ITIN group number ranges and expiration rules
- IRS TIN Matching API specifications and response codes

### Online Verification

The IRS TIN Matching service can verify all US tax IDs against official records:
- **Endpoint**: https://la1.www4.irs.gov/e-services/preparer/v1/api/tinmatching
- **Requirements**: IRS e-Services account, PKI certificate, business justification
- **Match codes**: 0-6 indicating various validation states
- **Setup guide**: `docs/US_TIN_MATCHING_GUIDE.md`