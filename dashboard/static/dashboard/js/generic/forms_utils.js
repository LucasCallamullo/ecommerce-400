

/**
 * Validates that the input string has at least a minimum number of characters
 * and does not contain unsafe characters like '<' or '>'.
 *
 * @param {string} value - The input string to validate.
 * @param {string} failedMessage - The message to display if validation fails.
 * @param {number} [length=2] - The minimum allowed length of the string.
 * @returns {string|null} Returns the trimmed input string if valid; otherwise, returns null.
 */
function validInputBasic(value, failedMessage, length = 2) {
    const cleanedName = value.trim();

    if (cleanedName.length <= length || /[<>]/.test(cleanedName)) {
        openAlert(failedMessage || 'Invalid input.', 'orange', 1800);
        return null;
    }

    return cleanedName;
}


/**
 * Validates whether the input value represents a valid decimal number.
 * 
 * This function is useful when dealing with user-entered prices that may include
 * formatting characters like commas or periods. It removes these characters and checks 
 * if the resulting string contains only digits.
 * 
 * @param {string|number} value - The input value to validate (e.g., a price string like "1,000.50").
 * @param {string} messageFailed - The message to display if validation fails.
 * @returns {string|null} - Returns the cleaned numeric string if valid, or null if invalid.
 */
function validPrice(value, messageFailed) {
    // 1. Remove all commas and periods from the string
    const cleanValue = value.toString().replace(/[.,]/g, '');
    
    // 2. Check if the cleaned value contains only digits
    if (/^\d+$/.test(cleanValue)) {
        return cleanValue; // Return the numeric string if valid
    }

    // 3. Show an alert message if the input is invalid
    openAlert(messageFailed, 'orange', 1500);
    return null;
}


/**
 * Validates if the input value is a non-negative integer (0 or greater).
 * Attempts to parse the input string to an integer and verifies its validity.
 *
 * @param {string} value - The input value to validate.
 * @param {string} failedMessage - The message to display if validation fails.
 * @returns {number|null} Returns the parsed integer if valid; otherwise, returns null.
 */
function validNonNegativeInteger(value, failedMessage) {
    const num = parseInt(value, 10) || 0; // Parse as base-10 integer

    if (isNaN(num) || !Number.isInteger(num) || num < 0) {
        // openAlert(failedMessage || 'Invalid input.', 'orange', 1800);
        return 0;
    }

    return num;
}


function validBoolCheckBox(value) {
    if (value === 'on' || value === true) return true;
    return false;
}
