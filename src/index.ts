import * as fs from 'fs';
import * as path from 'path';
import { generateMock } from './lib/generator';
import { MockContract } from './types';

function AbiToMock(
  abiPath: string, 
  outputDirectory: string = './out', 
  contractName: string = 'Contract'
): MockContract {
  try {
    if (!fs.existsSync(abiPath)) {
      throw new Error(`ABI file not found: ${abiPath}`);
    }

    let abiContent;
    try {
      abiContent = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    } catch (e) {
      throw new Error(`Invalid JSON in ABI file: ${abiPath}`);
    }

    if (!Array.isArray(abiContent) && !abiContent.abi) {
      throw new Error(`Invalid ABI format: expected array or object with 'abi' property`);
    }

    const mock = generateMock(abiContent, outputDirectory, contractName);
    
    let relativePath = path.relative(process.cwd(), path.resolve(outputDirectory));
    if (!relativePath.startsWith('.')) {
      relativePath = `./${relativePath}`;
    }
    console.log(`Mock generated at ${relativePath}/${contractName}.sol`);
    
    return mock;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error generating mock: ${error.message}`);
    }
    throw error;
  }
}

export default AbiToMock;