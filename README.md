# ABI-to-Mock

Generate Solidity mock contracts automatically from Ethereum ABIs.

## Features

- Generates fully functional Solidity mock contracts
- Supports complex data types including structs and nested arrays
- Handles both functions and events
- Maintains function signatures and event definitions
- Customizable contract names and output locations
- Available as both CLI tool and JavaScript library

## Quick Start

Generate a mock contract from an example ABI:

```bash
node src/cli.js tests/fixtures/StabilityPool.json --name StabilityPool
```

This will generate a mock implementation of the StabilityPool contract in the default `./out` directory.

## Installation

```bash
npm install abi-to-mock
```

## Usage

### Command Line Interface

```bash
npx abi-to-mock <abi-file> [options]
```

Options:
- `--out, -o`: Output directory (default: "./out")
- `--name, -n`: Contract name (default: "Contract")

Example:
```bash
npx abi-to-mock ./MyContract.json --out ./mocks --name MyContract
```

### Programmatic Usage

```javascript
const AbiToMock = require('abi-to-mock');

// Generate mock from ABI file
AbiToMock('./MyContract.json', './mocks', 'MyContract');

// Or use ABI object directly
const abi = [/* your ABI array */];
AbiToMock.generateMock(abi, './mocks', 'MyContract');
```

## Generated Mock Features

- Maintains original function signatures
- Implements customizable return values
- Tracks function calls and parameters
- Supports event emission
- Handles complex data structures
- Memory-safe implementation

## API Reference

### AbiToMock(abiPath, outputDirectory, contractName)

Parameters:
- `abiPath` (string): Path to ABI JSON file
- `outputDirectory` (string, optional): Output directory for generated mocks
- `contractName` (string, optional): Name of the contract

Returns:
- Object containing mock contract interface

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details

## Support

For support, issues, or feature requests, please file an issue in the GitHub repository.