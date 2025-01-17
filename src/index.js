const { generateMock } = require('./lib/generator');
const fs = require('fs');
const path = require('path');

function AbiToMock(abiPath, outputDirectory = './out', contractName = 'Contract') {
    try {
        const abiContent = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        const mock = generateMock(abiContent, outputDirectory, contractName);
        
        // Convert absolute path to relative for display, ensuring it starts with ./
        let relativePath = path.relative(process.cwd(), path.resolve(outputDirectory));
        if (!relativePath.startsWith('.')) {
            relativePath = `./${relativePath}`;
        }
        console.log(`Mock generated at ${relativePath}/${contractName}.sol`);
        
        return mock;
    } catch (error) {
        console.error('Error generating mock:', error);
        throw error;
    }
}

module.exports = AbiToMock;