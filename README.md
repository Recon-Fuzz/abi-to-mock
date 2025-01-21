# ABI-to-Mock

Generate Solidity mock contracts automatically from Ethereum ABIs.

## Features

- Generates fully functional Solidity mock contracts
- Supports complex data types including structs and nested arrays
- Maintains function signatures and event definitions
- Customizable contract names and output locations
- Available as both CLI tool and JavaScript library

## Installation

```bash
npm install abi-to-mock
```

## Usage

### Command Line Interface

```bash
npx abi-to-mock <abi-file> [options]

Options:
  --out, -o   Output directory (default: "./out")
  --name, -n  Contract name (default: "Contract")
```

Options:
- `--out, -o`: Output directory (default: "./out")
- `--name, -n`: Contract name (default: "Contract")

Example:
```bash
npx abi-to-mock ./MyContract.json --out ./mocks --name MyContract
```

## Using with foundry
```bash
forge build

npx abi-to-mock out/ERC20Mock.sol/ERC20Mock.json --name Erc20Mock --out src/
```

### Programmatic Usage

```javascript
// Node.js
const AbiToMock = require('abi-to-mock');
// or ES Modules
import AbiToMock from 'abi-to-mock';

// From file
AbiToMock('./MyContract.json', './mocks', 'MyContract');

// From ABI object
const abi = [
  {
    "inputs": [],
    "name": "getValue",
    "outputs": [{"type": "uint256"}],
    "type": "function"
  }
];
AbiToMock.generateMock(abi, './mocks', 'MyContract');

// Browser usage
import { generateMockString } from 'abi-to-mock';
const mockCode = generateMockString(abi, 'MyContract');
```

## Generated Mock Features

- Complete function signatures matching the original contract
- Setter functions for return values
- Complex type support (structs, arrays, mappings)

## API Reference

```js
// Node.js API
AbiToMock(abiPath: string, outputDir?: string, name?: string): MockContract
AbiToMock.generateMock(abi: ABI[], outputDir: string, name: string): MockContract

// Browser API
generateMockString(abi: ABI[], name: string): string
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support, issues, or feature requests, please file an issue in the GitHub repository.