/**
 * Throws error, can be used in an expression.
 */
export default function errorMessage(message: string): never {
  throw new Error(message);
}
