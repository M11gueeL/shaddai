/**
 * Prevents the entry of negative signs and scientific notation characters in number inputs.
 * Usage: <input type="number" onKeyDown={preventNegativeInput} ... />
 * @param {KeyboardEvent} e 
 */
export const preventNegativeInput = (e) => {
    // Prevent minus sign, 'e' (scientific notation), and 'E'
    if (['-', 'e', 'E'].includes(e.key)) {
        e.preventDefault();
    }
};

/**
 * Validates that a pasted value is a positive number.
 * Usage: <input type="number" onPaste={preventNegativePaste} ... />
 * @param {ClipboardEvent} e 
 */
export const preventNegativePaste = (e) => {
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('Text');

    if (parseFloat(pastedData) < 0) {
        e.preventDefault();
    }
};
