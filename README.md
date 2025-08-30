# Tax ID Validator

## Overview

`Tax ID Validator` is a robust tool designed for validating various tax identification numbers (TINs), such as GSTIN in India, UEN in Singapore, etc. The tool uses regular expressions and specific validation logic for each type of TIN, ensuring that the input adheres to the expected format and structural rules of the respective issuing authority.

## Features

- Supports multiple countries and TIN types.
- Uses precise regular expressions for format validation.
- Implements checksum logic for countries that incorporate checksum characters in their TINs.
- Easy to integrate and use in various JavaScript environments.

## Requirements

- Node.js (v14 or newer recommended)

## Installation

You can install the package via npm:

```bash
npm install corporate-taxid-checker-js
```

## Usage

The tool can be used by importing the main validator function and then calling it with the appropriate parameters.

Here's a basic example:

```javascript
const { validateTaxId } = require('corporate-taxid-checker-js');

const taxId = '1234567890';
const countryCode = 'IN'; // Use the appropriate country code

const result = validateTaxId(countryCode, taxId);
console.log(result); // logs true if valid, false if invalid
```

### US Tax ID Validation

The US module supports comprehensive validation for EIN, SSN, and ITIN with checksum validation and IRS TIN Matching API integration:

```javascript
const validateTaxId = require('corporate-taxid-checker-js');

// Validate US tax IDs (all types supported)
const einResult = await validateTaxId('US', '12-3456789');     // EIN validation
const ssnResult = await validateTaxId('US', '234-56-7890');    // SSN validation
const itinResult = await validateTaxId('US', '912-70-1234');   // ITIN validation

// With online verification via IRS TIN Matching (requires e-Services registration)
const onlineResult = await validateTaxId('US', '12-3456789', true);
```

The IRS TIN Matching service verifies ALL US tax ID types (EIN, SSN, ITIN) through one unified API. For setup instructions, see [US TIN Matching Guide](docs/US_TIN_MATCHING_GUIDE.md)
### Validation Levels

For enhanced accuracy and reliability, our tool offers three levels of TIN validation for several countries:

1.  **Regex Check:** This initial check ensures the TIN adheres to the expected format using precise regular expressions.
2.  **Checksum Validation:** Based on the guidelines from the [OECD](https://www.oecd.org/tax/automatic-exchange/crs-implementation-and-assistance/tax-identification-numbers/), this check verifies the integrity of the TIN using its checksum.
3.  **Authority Lookup:** This advanced check confirms the validity of the TIN by directly querying the respective country's tax authority:
   - **EU countries and Australia:** Direct online verification with tax authorities  
   - **United States:** IRS TIN Matching API for comprehensive EIN, SSN, and ITIN validation

## Supported Countries and TINs

The `Tax ID Validator` currently supports tax identification number validation for the following countries:

Country Code | Country | Regex Check | Checksum Check | Online Check
---|---|---|---|---
AL | Albania | ✅ | ✅ | 
DZ | Algeria | ✅ |  | 
AD | Andorra | ✅ | ✅ | 
AR | Argentina | ✅ | ✅ | 
AM | Armenia | ✅ |  | 
AU | Australia | ✅ | ✅ | ✅
AT | Austria | ✅ | ✅ | ✅
AZ | Azerbaijan |  | ✅ | 
BD | Bangladesh | ✅ |  | 
BY | Belarus |  | ✅ | 
BE | Belgium | ✅ | ✅ | ✅
BZ | Belize | ✅ | ✅ | 
BO | Bolivia | ✅ |  | 
BR | Brazil | ✅ | ✅ | 
BG | Bulgaria | ✅ | ✅ | ✅
KH | Cambodia | ✅ |  | 
CA | Canada | ✅ | ✅ | 
CL | Chile | ✅ | ✅ | 
CN | China | ✅ | ✅ | 
CO | Colombia | ✅ | ✅ | 
CR | Costa Rica | ✅ | ✅ | 
HR | Croatia | ✅ |  | ✅
CY | Cyprus | ✅ | ✅ | ✅
CZ | Czech Republic | ✅ | ✅ | ✅
DK | Denmark | ✅ | ✅ | ✅
DO | Dominican Republic | ✅ |  | 
EC | Ecuador | ✅ | ✅ | 
EG | Egypt | ✅ | ✅ | 
SV | El Salvador | ✅ | ✅ | 
EE | Estonia | ✅ | ✅ | ✅
FO | Faroe Islands | ✅ |  | 
FI | Finland | ✅ | ✅ | ✅
FR | France | ✅ | ✅ | 
GE | Georgia | ✅ |  | 
DE | Germany | ✅ | ✅ | ✅
GH | Ghana | ✅ | ✅ | 
GR | Greece | ✅ |  | ✅
GT | Guatemala | ✅ | ✅ | 
GN | Guinea | ✅ | ✅ | 
HK | Hong Kong | ✅ |  | 
HU | Hungary | ✅ | ✅ | ✅
IS | Iceland | ✅ |  | 
IN | India | ✅ | ✅ | 
ID | Indonesia | ✅ | ✅ | 
IE | Ireland | ✅ | ✅ | ✅
IL | Israel | ✅ | ✅ | 
IT | Italy | ✅ |  | ✅
JP | Japan | ✅ | ✅ | 
KE | Kenya | ✅ |  | 
LV | Latvia | ✅ |  | ✅
LI | Liechtenstein | ✅ |  | 
LT | Lithuania | ✅ |  | ✅
LU | Luxembourg | ✅ |  | ✅
MY | Malaysia | ✅ |  | 
MT | Malta | ✅ |  | ✅
MX | Mexico | ✅ | ✅ | 
MD | Moldova | ✅ |  | 
MC | Monaco | ✅ |  | 
ME | Montenegro | ✅ | ✅ | 
MA | Morocco | ✅ | ✅ | 
NL | Netherlands | ✅ | ✅ | ✅
NZ | New Zealand | ✅ | ✅ | 
NG | Nigeria | ✅ |  | 
MK | North Macedonia |  | ✅ | 
NO | Norway | ✅ | ✅ | 
PY | Paraguay | ✅ | ✅ | 
PE | Peru | ✅ | ✅ | 
PH | Philippines | ✅ |  | 
PL | Poland | ✅ | ✅ | ✅
PT | Portugal | ✅ | ✅ | ✅
RO | Romania | ✅ | ✅ | ✅
RU | Russia | ✅ | ✅ | 
RW | Rwanda | ✅ |  | 
SM | San Marino | ✅ | ✅ | 
SA | Saudi Arabia | ✅ |  | 
RS | Serbia | ✅ | ✅ | 
SG | Singapore | ✅ | ✅ | 
SK | Slovakia | ✅ | ✅ | ✅
SI | Slovenia | ✅ | ✅ | ✅
ZA | South Africa | ✅ | ✅ | 
KR | South Korea | ✅ | ✅ | 
ES | Spain | ✅ | ✅ | ✅
SE | Sweden | ✅ | ✅ | ✅
CH | Switzerland | ✅ | ✅ | 
TW | Taiwan | ✅ | ✅ | 
TH | Thailand | ✅ | ✅ | 
TN | Tunisia | ✅ | ✅ | 
TR | Turkey | ✅ | ✅ | 
UA | Ukraine | ✅ | ✅ | 
AE | United Arab Emirates | ✅ |  | 
GB | United Kingdom | ✅ |  | 
US | United States | ✅ | ✅ | ✅
UY | Uruguay | ✅ | ✅ | 
VE | Venezuela | ✅ | ✅ | 
VN | Vietnam | ✅ | ✅ | 

## Testing

To run the included tests:

```bash
npm run test
```

## Contributing

Contributions are welcome. Please fork the repository and submit a pull request with your changes. Ensure that your PR includes detailed information about the changes, including any new dependencies, environment variables, or required context.

## License
This project is licensed under the Creative Commons Attribution 4.0 International (CC BY 4.0) - see the LICENSE file for details.
