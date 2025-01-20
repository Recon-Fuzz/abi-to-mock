
import { generateMockString } from '../src/lib/generator';
import { describe, it, expect } from '@jest/globals';

describe('Browser Tests', () => {
  const testAbi = [{
    "inputs": [],
    "name": "testFunction",
    "outputs": [{"type": "uint256", "name": "result"}],
    "type": "function",
    "stateMutability": "view"
  }];

  it('should generate mock string without Node.js dependencies', () => {
    const mockString = generateMockString(testAbi, 'TestContract');
    expect(mockString).toContain('contract TestContract');
    expect(mockString).toContain('function testFunction()');
  });

  it('should handle array input without Node.js dependencies', () => {
    const result = generateMockString(testAbi);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle object with abi property', () => {
    const result = generateMockString({ abi: testAbi });
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});