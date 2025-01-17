const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('CLI Tests', () => {
    const fixtureAbiPath = path.join(__dirname, 'fixtures', 'test-abi.json');
    
    afterEach(() => {
        // Clean up test output directories
        ['./out', './customOut'].forEach(dir => {
            if (fs.existsSync(dir)) {
                fs.rmSync(dir, { recursive: true, force: true });
            }
        });
    });

    it('should parse mandatory abi argument', () => {
        const output = execSync(`node src/cli.js ${fixtureAbiPath}`).toString();
        expect(output).toContain('Mock generated at');
    });

    it('should parse optional --out argument', () => {
        const outputDir = './customOut';
        const output = execSync(`node src/cli.js ${fixtureAbiPath} --out ${outputDir}`).toString();
        expect(output).toContain(`Mock generated at ${outputDir}`);
    });

    it('should use default output directory if --out is not provided', () => {
        const output = execSync(`node src/cli.js ${fixtureAbiPath}`).toString();
        expect(output).toContain('Mock generated at ./out');
    });

    it('should parse optional --name argument', () => {
        const outputDir = './customOut';
        const contractName = 'Token';
        const output = execSync(`node src/cli.js ${fixtureAbiPath} --out ${outputDir} --name ${contractName}`).toString();
        expect(output).toContain(`Mock generated at ${outputDir}/${contractName}Mock.sol`);
    });

    it('should use default contract name if --name is not provided', () => {
        const outputDir = './customOut';
        const output = execSync(`node src/cli.js ${fixtureAbiPath} --out ${outputDir}`).toString();
        expect(output).toContain(`Mock generated at ${outputDir}/ContractMock.sol`);
    });
});