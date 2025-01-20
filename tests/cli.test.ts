import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { describe, it, expect, afterEach, beforeAll } from '@jest/globals';

describe('CLI Tests', () => {
    const fixtureAbiPath: string = path.join(__dirname, 'fixtures', 'test-abi.json');
    const cliPath = path.resolve(__dirname, '../dist/cli.js');
    
    beforeAll(() => {
        // Ensure the test ABI file exists
        if (!fs.existsSync(path.dirname(fixtureAbiPath))) {
            fs.mkdirSync(path.dirname(fixtureAbiPath), { recursive: true });
        }
        // Create a simple test ABI if it doesn't exist
        if (!fs.existsSync(fixtureAbiPath)) {
            fs.writeFileSync(fixtureAbiPath, JSON.stringify({
                abi: [{
                    "inputs": [],
                    "name": "testFunction",
                    "outputs": [],
                    "type": "function"
                }]
            }));
        }
    });

    afterEach(() => {
        ['./out', './customOut'].forEach((dir: string) => {
            if (fs.existsSync(dir)) {
                fs.rmSync(dir, { recursive: true, force: true });
            }
        });
    });

    it('should parse mandatory abi argument', () => {
        const output = execSync(`node ${cliPath} ${fixtureAbiPath}`).toString();
        expect(output).toContain('Mock generated at');
    });

    it('should parse optional --out argument', () => {
        const outputDir = './customOut';
        const output = execSync(`node ${cliPath} ${fixtureAbiPath} --out ${outputDir}`).toString();
        expect(output).toContain(`Mock generated at ${outputDir}`);
    });

    it('should use default output directory if --out is not provided', () => {
        const output = execSync(`node ${cliPath} ${fixtureAbiPath}`).toString();
        expect(output).toContain('Mock generated at ./out');
    });

    it('should parse optional --name argument', () => {
        const outputDir = './customOut';
        const contractName = 'Token';
        const output = execSync(`node ${cliPath} ${fixtureAbiPath} --out ${outputDir} --name ${contractName}`).toString();
        expect(output).toContain(`Mock generated at ${outputDir}/${contractName}.sol`);
    });

    it('should use default contract name if --name is not provided', () => {
        const outputDir = './customOut';
        const output = execSync(`node ${cliPath} ${fixtureAbiPath} --out ${outputDir}`).toString();
        expect(output).toContain(`Mock generated at ${outputDir}/ContractMock.sol`);
    });
});