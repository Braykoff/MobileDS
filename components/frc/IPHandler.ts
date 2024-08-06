/** Regex to validate a string is only numbers. */
const regexNumberOnlyValidator = /^\d+$/;

/** Regex to validate a string is only numbers, letters, periods, and dashes. */
const regexHostAddress = /^[\.\-a-zA-Z0-9]*$/;

/** Regex to check for two consecutive periods. */
const regexDoublePeriods = /\.\./;

/**
 * Checks if an input is a valid team number (0 - 25599).
 * @param input The input to check.
 * @returns Whether it is a valid team number.
 */
export function isValidTeamNumber(input: string): boolean {
  if (input.length < 1 || input.length > 5 || !regexNumberOnlyValidator.test(input)) {
    // Input contains non-numerical characters
    return false;
  }

  try {
    var teamNumber = parseInt(input);
    return (teamNumber >= 0) && (teamNumber <= 25599);
  } catch {
    // Failed to parse int
    return false;
  }
}

/**
 * Converts a team number to the RoboRio's IP address. Check that it is valid with 
 * isValidTeamNumber(input) first.
 * @param teamNumber The team number of the RoboRio.
 * @return A formatted IP address (10.TE.AM.2)
 */
export function teamNumberToIPAddress(teamNumber: string): string {
  if (teamNumber.length == 1 || teamNumber.length == 2) {
    // 10.0.X.2 or 10.0.XX.2
    return `10.0.${teamNumber}.2`;
  } else if (teamNumber.length == 3) {
    // 10.X.XX.2
    return `10.${teamNumber.substring(0, 1)}.${teamNumber.substring(1, 3)}.2`;
  } else if (teamNumber.length == 4) {
    // 10.XX.XX.2
    return `10.${teamNumber.substring(0, 2)}.${teamNumber.substring(2, 4)}.2`;
  } else if (teamNumber.length == 5) {
    // 10.XXX.XX.2
    return `10.${teamNumber.substring(0, 3)}.${teamNumber.substring(3, 5)}.2`;
  } else {
    console.warn(`Failed to convert team number '${teamNumber}' to IP address.`);
    return "localhost";
  }
}

/**
 * Checks if an input is a valid host (hostname or ip address).
 * @param input The input to check.
 * @returns Whether it is valid.
 */
export function isValidHost(input: string): boolean {
  return (
    input.length >= 1 && // Check for empty string
    regexHostAddress.test(input) && // Check if only has letters, numbers, periods, and dashes
    !regexDoublePeriods.test(input) && // Check for multiple consecutive periods
    input.indexOf(".") != -1 && // Check that periods exist
    input.at(0) != "." && // Check for leading period
    input.at(-1) != "." // Check for trailing period
  );
}
