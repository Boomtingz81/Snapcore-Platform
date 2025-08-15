/**
 * Utility Validators for SnapCore App
 * Provides functions to validate UK plates, VIN numbers, and email addresses.
 */

/**
 * Validates UK Number Plate Format (e.g., AB12 CDE).
 * @param {string} plate - The vehicle registration plate to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
export const isValidUKPlate = (plate = "") => {
  const regex = /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$/i;
  return regex.test(plate.trim().toUpperCase());
};

/**
 * Validates VIN Number (17 characters, excludes I/O/Q).
 * @param {string} vin - The Vehicle Identification Number to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
export const isValidVIN = (vin = "") => {
  const regex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return regex.test(vin.trim().toUpperCase());
};

/**
 * Validates an email address format.
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
export const isValidEmail = (email = "") => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim().toLowerCase());
};
