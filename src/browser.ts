import { generateMockString } from './lib/generator';

export { generateMockString };

export default function generateMock(
  abi: any[] | { abi: any[] },
  contractName: string = 'Contract'
): string {
  return generateMockString(abi, contractName);
}