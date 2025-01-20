import { generateMockString } from './lib/generator';

// Export only the browser-safe function
export { generateMockString };

// Export as default for easier imports
export default generateMockString;

// Add a dummy generateMock that throws an error in browser
export const generateMock = () => {
  throw new Error('generateMock is not supported in browser environment. Use generateMockString instead.');
};