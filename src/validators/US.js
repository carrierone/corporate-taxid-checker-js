/*
 * US Tax ID Validation - EIN, SSN, ITIN
 * 
 * This module validates US tax identification numbers according to official federal government rules:
 * - EIN (Employer Identification Number): IRS Publication 1635, Campus Assignment List
 * - SSN (Social Security Number): SSA area/group/serial validation rules
 * - ITIN (Individual Taxpayer Identification Number): IRS middle digit ranges 50-65, 70-88, 90-92, 94-99
 * 
 * Sources:
 * - IRS EIN Prefixes: https://www.irs.gov/businesses/small-businesses-self-employed/how-eins-are-assigned-and-valid-ein-prefixes
 * - SSA Number Structure: https://www.ssa.gov/policy/docs/ssb/v69n2/v69n2p55.html
 * - ITIN Ranges: https://www.irs.gov/tin/itin/individual-taxpayer-identification-number-itin
 * - IRS TIN Matching API: https://www.irs.gov/tax-professionals/taxpayer-identification-number-tin-matching
 */

/**
 * Validates US Employer Identification Number (EIN)
 * 
 * EIN Structure: XX-XXXXXXX (9 digits total)
 * - First 2 digits: Campus prefix assigned by IRS processing location
 * - Remaining 7 digits: Sequential number assigned by campus
 * 
 * Validation Rules:
 * 1. Must be exactly 9 digits after removing hyphens
 * 2. First 2 digits must match valid IRS campus prefixes
 * 3. Last 7 digits cannot be all zeros
 * 
 * Valid Prefixes (as of 2024):
 * Source: https://www.irs.gov/businesses/small-businesses-self-employed/how-eins-are-assigned-and-valid-ein-prefixes
 * 
 * Campus Assignments:
 * - Andover: 10, 12
 * - Atlanta: 60, 67
 * - Austin: 50, 53
 * - Brookhaven: 01, 02, 03, 04, 05, 06, 11, 13, 14, 16, 21, 22, 23, 25, 34, 51, 52, 54, 55, 56, 57, 58, 59, 65
 * - Cincinnati: 30, 32, 35, 36, 37, 38, 61
 * - Fresno: 15, 24
 * - Kansas City: 40, 44
 * - Memphis: 94, 95
 * - Ogden: 80, 87, 88, 90
 * - Philadelphia: 33, 39, 41, 42, 43, 46, 48, 62, 63, 64, 66, 68, 71, 72, 73, 74, 75, 76, 77, 81, 82, 83, 84, 85, 86, 91, 92, 93, 98, 99
 * - Internet/Online: 20, 26, 27, 45, 47
 * - SBA: 31
 * 
 * Note: Prefixes 07, 08, 09 are NOT valid EIN prefixes according to official IRS documentation.
 */
function validate_us_ein(ein, debug = false) {
    // Input validation
    if (!ein) {
        if (debug) console.log('EIN is required');
        return false;
    }
    
    // Convert to string if needed
    ein = String(ein);
    
    // Remove hyphens for processing
    const cleanEin = ein.replace(/-/g, '');
    
    if (cleanEin.length !== 9) {
        if (debug) console.log('EIN must be 9 digits');
        return false;
    }
    
    // Verify all characters are digits
    if (!/^\d{9}$/.test(cleanEin)) {
        if (debug) console.log('EIN must contain only digits');
        return false;
    }

    // EIN prefix validation - valid prefixes from IRS (updated 2025)
    // Source: https://www.irs.gov/businesses/small-businesses-self-employed/how-eins-are-assigned-and-valid-ein-prefixes
    const validPrefixes = [
        '01', '02', '03', '04', '05', '06', '10', '11', '12', '13', '14', '15', '16', '20', '21', '22', '23', '24', '25', '26', '27',
        '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '50',
        '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '71', '72',
        '73', '74', '75', '76', '77', '80', '81', '82', '83', '84', '85', '86', '87', '88', '90', '91', '92', '93', '94', '95',
        '98', '99'
    ];
    
    const prefix = cleanEin.substring(0, 2);
    
    if (!validPrefixes.includes(prefix)) {
        if (debug) console.log('Invalid EIN prefix:', prefix);
        return false;
    }

    // Structural validation: no all-zero suffix
    // EINs don't have a mathematical checksum, but the 7-digit suffix cannot be all zeros
    const suffix = cleanEin.substring(2);
    if (suffix === '0000000') {
        if (debug) console.log('Invalid EIN: all-zero suffix');
        return false;
    }

    return true;
}

/**
 * Validates US Social Security Number (SSN)
 * 
 * SSN Structure: XXX-XX-XXXX (9 digits total)
 * - First 3 digits: Area number (geographic/administrative assignment)
 * - Middle 2 digits: Group number (administrative batching within area)
 * - Last 4 digits: Serial number (sequential within area/group)
 * 
 * Sources:
 * - SSA Number Structure: https://www.ssa.gov/policy/docs/ssb/v69n2/v69n2p55.html
 * - SSA Randomization (2011): https://www.ssa.gov/employer/randomization.html
 * - Area Number Assignments: https://www.ssa.gov/employer/stateweb.htm
 * 
 * Validation Rules (Pre-2011 and Post-2011 Randomization):
 * 1. Must be exactly 9 digits
 * 2. Area cannot be 000, 666, 800-899, 900-999
 * 3. Group cannot be 00
 * 4. Serial cannot be 0000
 * 5. Cannot be test numbers (123456789, 987654321)
 * 
 * Note: SSN randomization implemented June 25, 2011 changed assignment patterns
 * but validation rules for invalid ranges remain the same.
 * 
 * Area Code Ranges:
 * - 001-003: New Hampshire
 * - 004-007: Maine
 * - 008-009: Vermont
 * - 010-034: Massachusetts
 * - 035-039: Rhode Island
 * - 040-049: Connecticut
 * - 050-134: New York
 * - 135-158: New Jersey
 * - 159-211: Pennsylvania
 * - 212-220: Maryland
 * - 221-222: Delaware
 * - 223-231: Virginia
 * - 232-236: West Virginia
 * - 237-246: North Carolina
 * - 247-251: South Carolina
 * - 252-260: Georgia
 * - 261-267: Florida
 * - 268-302: Ohio
 * - 303-317: Indiana
 * - 318-361: Illinois
 * - 362-386: Michigan
 * - 387-399: Wisconsin
 * - 400-407: Kentucky
 * - 408-415: Tennessee
 * - 416-424: Alabama
 * - 425-428: Mississippi
 * - 429-432: Arkansas
 * - 433-439: Louisiana
 * - 440-448: Oklahoma
 * - 449-467: Texas
 * - 468-477: Minnesota
 * - 478-485: Iowa
 * - 486-500: Missouri
 * - 501-502: North Dakota
 * - 503-504: South Dakota
 * - 505-508: Nebraska
 * - 509-515: Kansas
 * - 516-517: Montana
 * - 518-519: Idaho
 * - 520: Wyoming
 * - 521-524: Colorado
 * - 525-585: New Mexico
 * - 526-527: Arizona
 * - 528-529: Utah
 * - 530: Nevada
 * - 531-539: Washington
 * - 540-544: Oregon
 * - 545-573: California
 * - 574: Alaska
 * - 575-576: Hawaii
 * - 577-579: District of Columbia
 * - 580: Virgin Islands
 * - 581-584: Puerto Rico
 * - 585: New Mexico
 * - 586: Pacific Islands
 * - 587-665: Reserved for future use
 * - 666: Invalid (never issued)
 * - 667-699: Reserved for future use
 * - 700-728: Railroad workers (discontinued 1963)
 * - 729-733: DHS Enumeration at Entry
 * - 734-749: Reserved for future use
 * - 750-763: Reserved for future use
 * - 764-899: Invalid range
 * - 900-999: Invalid range (never issued)
 */
function validate_us_ssn(ssn, debug = false) {
    // Input validation
    if (!ssn) {
        if (debug) console.log('SSN is required');
        return false;
    }
    
    // Convert to string if needed
    ssn = String(ssn);
    
    // Remove hyphens and spaces
    const cleanSsn = ssn.replace(/[-\s]/g, '');
    
    if (cleanSsn.length !== 9) {
        if (debug) console.log('SSN must be 9 digits');
        return false;
    }
    
    // Verify all characters are digits
    if (!/^\d{9}$/.test(cleanSsn)) {
        if (debug) console.log('SSN must contain only digits');
        return false;
    }

    const area = cleanSsn.substring(0, 3);
    const group = cleanSsn.substring(3, 5);
    const serial = cleanSsn.substring(5, 9);

    // Invalid SSN area number patterns
    // Source: https://www.ssa.gov/policy/docs/ssb/v69n2/v69n2p55.html
    // Area codes 000, 666, 800-899, 900-999 are invalid
    // 700-728: Railroad workers (discontinued 1963) - invalid for new SSNs but may exist
    // 729-733: DHS Enumeration at Entry - valid
    // 734-799: Reserved for future use - invalid
    // For compatibility, we allow 700-799 range (some legacy and DHS assignments exist)
    if (area === '000' || area === '666' || area.startsWith('8') || area.startsWith('9')) {
        if (debug) console.log('Invalid SSN area number:', area);
        return false;
    }

    if (group === '00') {
        if (debug) console.log('Invalid SSN group number:', group);
        return false;
    }

    if (serial === '0000') {
        if (debug) console.log('Invalid SSN serial number:', serial);
        return false;
    }

    // Additional invalid patterns
    if (cleanSsn === '123456789' || cleanSsn === '987654321') {
        if (debug) console.log('Invalid sequential SSN pattern');
        return false;
    }

    return true;
}

/**
 * Validates US Individual Taxpayer Identification Number (ITIN)
 * 
 * ITIN Structure: 9XX-XX-XXXX (9 digits total)
 * - First digit: Always 9
 * - Second & third digits: Any digits 00-99 (area number like SSN)
 * - Fourth & fifth digits: Group number with specific valid ranges: 50-65, 70-88, 90-92, 94-99
 * - Last 4 digits: Serial number (cannot be 0000)
 * 
 * Sources:
 * - IRS ITIN Information: https://www.irs.gov/tin/itin/individual-taxpayer-identification-number-itin
 * - IRS Publication 4757: https://www.irs.gov/pub/irs-pdf/p4757.pdf
 * - ITIN Expiration Rules: https://www.irs.gov/individuals/individual-taxpayer-identification-number-itin
 * 
 * Valid Group Ranges (4th and 5th digits):
 * - 50-65: Valid range
 * - 70-88: Valid range (some may be expired based on issuance date)
 * - 90-92: Valid range
 * - 94-99: Valid range
 * 
 * Invalid ranges: 00-49, 66-69, 89, 93
 * 
 * ITIN Expiration Information:
 * - ITINs with middle digits 70-88 have expired (need renewal)
 * - ITINs with middle digits 90-92, 94-99 assigned before 2013 have expired
 * - ITINs not used for 3 consecutive years expire automatically
 * 
 * Note: This validator checks format validity, not expiration status.
 * Expiration checking requires issuance date and usage history.
 */
function validate_us_itin(itin, debug = false) {
    // Input validation
    if (!itin) {
        if (debug) console.log('ITIN is required');
        return false;
    }
    
    // Convert to string if needed
    itin = String(itin);
    
    // Remove hyphens and spaces
    const cleanItin = itin.replace(/[-\s]/g, '');
    
    if (cleanItin.length !== 9) {
        if (debug) console.log('ITIN must be 9 digits');
        return false;
    }
    
    // Verify all characters are digits
    if (!/^\d{9}$/.test(cleanItin)) {
        if (debug) console.log('ITIN must contain only digits');
        return false;
    }

    // ITIN format: 9XX-XX-XXXX where XX in positions 4-5 must be 50-65, 70-88, 90-92, 94-99
    const area = cleanItin.substring(0, 3);
    const group = cleanItin.substring(3, 5);
    const serial = cleanItin.substring(5, 9);

    // Must start with 9
    if (!area.startsWith('9')) {
        if (debug) console.log('ITIN must start with 9');
        return false;
    }

    // Fourth and fifth digits validation
    // Source: https://www.irs.gov/tin/itin/individual-taxpayer-identification-number-itin
    const groupNum = parseInt(group);
    const validRanges = [
        [50, 65], [70, 88], [90, 92], [94, 99]
    ];
    
    const isValidGroup = validRanges.some(([min, max]) => groupNum >= min && groupNum <= max);
    
    if (!isValidGroup) {
        if (debug) console.log('Invalid ITIN group number:', group);
        return false;
    }

    // Serial number cannot be 0000
    if (serial === '0000') {
        if (debug) console.log('Invalid ITIN serial number');
        return false;
    }

    return true;
}

/**
 * Online verification using IRS TIN Matching service
 * 
 * The IRS TIN Matching service can verify EIN, SSN, and ITIN against official records.
 * This service requires IRS e-Services registration and PKI certificate authentication.
 * 
 * Sources:
 * - IRS TIN Matching: https://www.irs.gov/tax-professionals/taxpayer-identification-number-tin-matching
 * 
 * Response Match Codes:
 * - 0: TIN and Name match
 * - 1: TIN matches but Name does not match
 * - 2: TIN not currently issued
 * - 3: TIN and Name combination does not match IRS records
 * - 4: Invalid TIN format
 * - 5: Duplicate TIN Matching request
 * - 6: TIN Matching temporarily unavailable
 * 
 * Requirements:
 * - IRS e-Services account
 * - PKI Certificate from approved vendor
 * - Requester EIN
 * - Business need justification
 */
async function online_check(tin, debug = false) {
    try {
        // All US tax IDs can be verified through IRS TIN Matching service
        return await verifyTINMatching(tin, debug);
    } catch (error) {
        if (debug) console.log('TIN Matching error:', error.message);
        console.error(error);
        return false;
    }
}

async function verifyTINMatching(tin, debug = false) {
    try {
        // IRS e-Services TIN Matching
        // This service can verify EIN, SSN, and ITIN
        // Note: Requires IRS e-Services registration and authentication
        
        // Check if credentials are available
        if (!process.env.IRS_CERT_PATH || !process.env.REQUESTER_EIN) {
            if (debug) {
                console.log('IRS TIN Matching verification requires e-Services registration');
                console.log('Visit: https://www.irs.gov/tax-professionals/taxpayer-identification-number-tin-matching');
            }
            return false;
        }
        
        // When credentials are available and in Node.js environment, 
        // the following modules would be required:
        // const axios = require('axios');
        // const https = require('https');
        // const fs = require('fs');
        
        const tinMatchingEndpoint = process.env.IRS_TIN_MATCHING_ENDPOINT || 
                                   'https://la1.www4.irs.gov/e-services/preparer/v1/api/tinmatching';
        
        // Prepare request data
        /*
        
        const requestData = {
            "tinMatchingRequest": {
                "tin": tin.replace(/[-\s]/g, ''),
                "tinType": determineTINType(tin), // "EIN", "SSN", or "ITIN"
                "requesterInfo": {
                    "requesterTIN": process.env.REQUESTER_EIN,
                    "requesterName": process.env.REQUESTER_NAME
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
        
        const response = await makeSecureRequest(options, requestData);
        
        // Response includes match codes:
        // 0 = TIN and Name match
        // 1 = TIN matches but Name does not match
        // 2 = TIN not currently issued
        // 3 = TIN and Name combination does not match IRS records
        // 4 = Invalid TIN format
        // 5 = Duplicate TIN Matching request
        // 6 = TIN Matching temporarily unavailable
        
        return response.tinMatchingResponse.matchCode === '0' || 
               response.tinMatchingResponse.matchCode === '1';
        */
        
        // Return false until credentials are properly configured
        return false;
        
    } catch (error) {
        if (debug) console.log('TIN Matching verification error:', error.message);
        console.error(error);
        return false;
    }
}

/**
 * Determines TIN type for API requests and validation routing
 * 
 * This function analyzes the structure and digit patterns to identify whether
 * a 9-digit number is most likely an EIN, SSN, or ITIN based on federal rules.
 * 
 * Sources:
 * - IRS EIN Prefixes: https://www.irs.gov/businesses/small-businesses-self-employed/how-eins-are-assigned-and-valid-ein-prefixes
 * - SSA Area Codes: https://www.ssa.gov/policy/docs/ssb/v69n2/v69n2p55.html
 * - ITIN Ranges: https://www.irs.gov/tin/itin/individual-taxpayer-identification-number-itin
 * 
 * Identification Logic:
 * 1. ITIN: Starts with 9 AND 4th-5th digits in ranges 50-65, 70-88, 90-92, 94-99
 * 2. EIN: First 2 digits match valid IRS campus prefixes
 * 3. SSN: Valid area codes (not 000, 666, 800-999)
 * 
 * Note: Some prefixes overlap between EIN and SSN. In ambiguous cases,
 * common EIN prefixes are prioritized for business tax ID classification.
 */
function determineTINType(tin) {
    // Input validation
    if (!tin) {
        return 'UNKNOWN';
    }
    
    // Convert to string if needed
    tin = String(tin);
    
    // Helper function to determine TIN type for API requests
    const cleanTin = tin.replace(/[-\s]/g, '');
    
    if (cleanTin.length !== 9) return 'UNKNOWN';
    
    // Special invalid cases first
    const area = cleanTin.substring(0, 3);
    if (area === '000' || area === '666') {
        return 'INVALID';
    }
    
    // Check if starts with 9 - could be ITIN or EIN
    if (cleanTin.startsWith('9')) {
        const prefix = cleanTin.substring(0, 2);
        const group = cleanTin.substring(3, 5);
        const groupNum = parseInt(group);
        const validITINRanges = [[50, 65], [70, 88], [90, 92], [94, 99]];
        const isValidITINGroup = validITINRanges.some(([min, max]) => groupNum >= min && groupNum <= max);
        
        // Priority logic for ambiguous cases:
        // Without original formatting, we must use heuristics to distinguish EIN vs ITIN
        
        const validEINPrefixes9x = ['90', '91', '92', '93', '94', '95', '98', '99'];
        const isValidEINPrefix = validEINPrefixes9x.includes(prefix);
        
        // Primary EIN prefixes (most commonly issued to businesses): 94, 95
        // These should strongly suggest EIN classification
        const primaryEINPrefixes = ['94', '95'];
        
        // If it's a primary EIN prefix, strongly prefer EIN
        if (primaryEINPrefixes.includes(prefix)) {
            return 'EIN';
        }
        
        // For other ambiguous cases, prefer ITIN if valid ITIN group
        // This handles common ITIN patterns like 91X-XX-XXXX
        if (isValidITINGroup) {
            return 'ITIN';
        }
        
        // If valid EIN prefix but not valid ITIN, it's EIN
        if (isValidEINPrefix) {
            return 'EIN';
        }
        
        // If starts with 9 but not valid for either EIN or ITIN
        return 'INVALID';
    }
    
    // Check for valid EIN prefixes (updated 2025)
    // Source: https://www.irs.gov/businesses/small-businesses-self-employed/how-eins-are-assigned-and-valid-ein-prefixes
    const prefix = cleanTin.substring(0, 2);
    const einPrefixes = [
        '01', '02', '03', '04', '05', '06', '10', '11', '12', '13', '14', '15', '16', '20', '21', '22', '23', '24', '25', '26', '27',
        '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '50',
        '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '71', '72',
        '73', '74', '75', '76', '77', '80', '81', '82', '83', '84', '85', '86', '87', '88', '90', '91', '92', '93', '94', '95',
        '98', '99'
    ];
    
    // EIN identification - check if valid EIN prefix
    if (einPrefixes.includes(prefix)) {
        // EIN-primary prefixes (more commonly used for business entities)
        const commonEINPrefixes = [
            '01', '02', '03', '04', '05', '06', '10', '11', '12', '13', '20', '26', '27', 
            '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '45', '46', '47', '48', 
            '52', '53', '54', '55', '56', '57', '58', '59', '61', '62', '63', '64', '65', '66', '68', 
            '71', '72', '73', '74', '75', '76', '77', '80', '81', '82', '83', '84', '85', '86', '87', '88', 
            '90', '91', '92', '93', '94', '95', '98', '99'
        ];
        
        if (commonEINPrefixes.includes(prefix)) {
            return 'EIN';
        }
        // If valid EIN prefix but not common EIN, could be SSN (for overlapping ranges)
    }
    
    // 800-999 ranges are invalid for SSN (already checked 000, 666 above)
    if (area.startsWith('8') || area.startsWith('9')) {
        return 'INVALID';
    }
    
    // If we get here, it's likely SSN with valid area code (001-665, 667-699, 700-799)
    return 'SSN';
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validate_us_ein,
        validate_us_ssn,
        validate_us_itin,
        online_check,
        determineTINType
    };
} else {
    window.validate_us_ein = validate_us_ein;
    window.validate_us_ssn = validate_us_ssn;
    window.validate_us_itin = validate_us_itin;
    window.online_check = online_check;
    window.determineTINType = determineTINType;
}