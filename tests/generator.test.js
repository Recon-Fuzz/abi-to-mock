// This file contains unit tests for the functions in generator.js. 
// It ensures that the mock generation logic works as expected.

const { generateMock } = require('../src/lib/generator');
const fs = require('fs');
const path = require('path');

describe('Mock Generation', () => {
    let outputDirectory;

    beforeEach(() => {
        // Use relative path from CWD
        outputDirectory = './test-output';
        // Ensure output directory exists and is clean
        if (fs.existsSync(outputDirectory)) {
            fs.rmSync(outputDirectory, { recursive: true, force: true });
        }
        fs.mkdirSync(outputDirectory, { recursive: true });
    });

    afterEach(() => {
        // Clean up test directory
        if (fs.existsSync(outputDirectory)) {
            fs.rmSync(outputDirectory, { recursive: true, force: true });
        }
    });

    test('should generate mock for valid ABI', () => {
        const abi = {/* mock ABI object */ };
        const mock = generateMock(abi, outputDirectory);
        expect(mock).toBeDefined();
        // Add more assertions based on expected mock structure
    });

    test('should handle empty ABI', () => {
        const abi = {};
        const mock = generateMock(abi, outputDirectory);
        expect(mock).toEqual({});
    });

    test('should generate mock for ABI with functions', () => {
        const abi = [
            {
                "inputs": [],
                "name": "testFunction",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];
        const mock = generateMock(abi, outputDirectory);
        expect(mock.functions).toBeDefined();
        expect(mock.functions.testFunction).toBeDefined();
    });

    test('should generate mock for ABI with events', () => {
        const abi = [
            {
                "anonymous": false,
                "inputs": [],
                "name": "testEvent",
                "type": "event"
            }
        ];
        const mock = generateMock(abi, outputDirectory);
        expect(mock.events).toBeDefined();
        expect(mock.events.testEvent).toBeDefined();
    });

    test('should generate mock file from template', () => {
        const abi = [
            {
                "inputs": [
                    { "name": "recipient", "type": "address", "internalType": "address" },
                    { "name": "amount", "type": "uint256", "internalType": "uint256" }
                ],
                "name": "transfer",
                "outputs": [{ "type": "bool", "internalType": "bool" }],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];
        generateMock(abi, outputDirectory, "ContractMock1");

        const mockPath = path.join(outputDirectory, 'ContractMock1.sol');
        expect(fs.existsSync(mockPath)).toBe(true);

        const content = fs.readFileSync(mockPath, 'utf8');
        expect(content).toContain('contract ContractMock');
        expect(content).toContain('function transfer(address recipient, uint256 amount)');
        expect(content).toContain('bool private _transferReturn_0');
        expect(content).toContain('function setTransferReturn(bool _value0)');
    });

    test('should handle struct inputs and outputs', () => {
        const abi = [
            {
                "inputs": [
                    {
                        "components": [
                            { "name": "id", "type": "uint256", "internalType": "uint256" },
                            { "name": "trader", "type": "address", "internalType": "address" }
                        ],
                        "internalType": "struct Order",
                        "name": "order",
                        "type": "tuple"
                    }
                ],
                "name": "submitOrder",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];

        generateMock(abi, outputDirectory, 'ContractMock2');

        const mockPath = path.join(outputDirectory, 'ContractMock2.sol');
        const content = fs.readFileSync(mockPath, 'utf8');

        // Check struct definition with internal type name
        expect(content).toContain('struct Order {');
        expect(content).toContain('uint256 id;');
        expect(content).toContain('address trader;');

        // Check function signature with internal type name
        expect(content).toContain('function submitOrder(Order memory order)');
    });

    test('should handle array types', () => {
        const abi = [
            {
                "inputs": [
                    { "name": "trader", "type": "address", "internalType": "address" }
                ],
                "name": "getOrders",
                "outputs": [
                    {
                        "components": [
                            { "name": "id", "type": "uint256", "internalType": "uint256" },
                            { "name": "trader", "type": "address", "internalType": "address" }
                        ],
                        "internalType": "struct Order[]",
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ];

        generateMock(abi, outputDirectory, 'ContractMock3');

        const mockPath = path.join(outputDirectory, 'ContractMock3.sol');
        const content = fs.readFileSync(mockPath, 'utf8');

        // Check array return type
        expect(content).toContain('Order[] private _getOrdersReturn_0');
        expect(content).toContain('function setGetOrdersReturn(Order[] memory _value0)');
    });

    test('should handle complex nested types', () => {
        const abi = [
            {
                "inputs": [
                    { "name": "user", "type": "address", "internalType": "address" }
                ],
                "name": "getUserProfile",
                "outputs": [
                    {
                        "components": [
                            { "name": "name", "type": "string", "internalType": "string" },
                            { "name": "active", "type": "bool", "internalType": "bool" },
                            { "name": "balance", "type": "uint256", "internalType": "uint256" },
                            {
                                "name": "roles",
                                "type": "uint8[]",
                                "internalType": "enum UserRole[]",
                                "components": []
                            }
                        ],
                        "internalType": "struct UserProfile",
                        "name": "",
                        "type": "tuple"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ];


        generateMock(abi, outputDirectory, 'ContractMock4');

        const mockPath = path.join(outputDirectory, 'ContractMock4.sol');
        const content = fs.readFileSync(mockPath, 'utf8');

        // Check struct with array field using internalType name
        expect(content).toContain('struct UserProfile {');
        expect(content).toContain('string name;');
        expect(content).toContain('bool active;');
        expect(content).toContain('uint256 balance;');
        expect(content).toContain('uint8[] roles;');

        // Check getter/setter with correct type name
        expect(content).toContain('UserProfile private _getUserProfileReturn_0');
        expect(content).toContain('function setGetUserProfileReturn(UserProfile memory _value0)');
    });

    test('should handle events with complex types', () => {
        const abi = [
            {
                "anonymous": false,
                "inputs": [
                    {
                        "components": [
                            { "name": "id", "type": "uint256", "internalType": "uint256" },
                            { "name": "trader", "type": "address", "internalType": "address" },
                            { "name": "status", "type": "uint8", "internalType": "enum OrderStatus" },
                            { "name": "orderType", "type": "uint8", "internalType": "enum OrderType" }
                        ],
                        "internalType": "struct Order",
                        "name": "order",
                        "type": "tuple"
                    }
                ],
                "name": "OrderSubmitted",
                "type": "event"
            }
        ];


        generateMock(abi, outputDirectory, 'ContractMock5');

        const mockPath = path.join(outputDirectory, 'ContractMock5.sol');
        const content = fs.readFileSync(mockPath, 'utf8');

        // Check event definition with proper type names
        expect(content).toContain('event OrderSubmitted(Order order)');
        expect(content).toContain('struct Order {');
        expect(content).toContain('uint256 id;');
        expect(content).toContain('address trader;');
        expect(content).toContain('uint8 status;');
        expect(content).toContain('uint8 orderType;');
    });

    test('should handle multi-dimensional arrays', () => {
        const abi = [
            {
                "inputs": [
                    { "name": "addresses", "type": "address[2][]", "internalType": "address[2][]" },
                    {
                        "components": [
                            { "name": "id", "type": "uint256" },
                            { "name": "trader", "type": "address" }
                        ],
                        "internalType": "struct Order[][2]",
                        "name": "orders",
                        "type": "tuple[][2]"
                    },
                    { "name": "numbers", "type": "uint256[2]", "internalType": "uint256[2]" }
                ],
                "name": "processOrders",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];


        generateMock(abi, outputDirectory, 'ContractMock6');

        const mockPath = path.join(outputDirectory, 'ContractMock6.sol');
        const content = fs.readFileSync(mockPath, 'utf8');

        expect(content).toContain('struct Order {');
        expect(content).toContain('function processOrders(address[2][] memory addresses, Order[][2] memory orders, uint256[2] memory numbers)');
    });

    test('should handle multi-dimensional array returns', () => {
        const abi = [
            {
                "inputs": [],
                "name": "getMultiArray",
                "outputs": [
                    {
                        "components": [
                            { "name": "id", "type": "uint256" },
                            { "name": "trader", "type": "address" }
                        ],
                        "internalType": "struct Order[][2]",
                        "name": "",
                        "type": "tuple[][2]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ];
        
        generateMock(abi, outputDirectory, 'ContractMock8');
        
        const mockPath = path.join(outputDirectory, 'ContractMock8.sol');
        const content = fs.readFileSync(mockPath, 'utf8');
        
        // Check struct definition
        expect(content).toContain('struct Order {');
        expect(content).toContain('uint256 id;');
        expect(content).toContain('address trader;');
        
        // Check storage variable declaration
        expect(content).toContain('Order[][2] private _getMultiArrayReturn_0');
        
        // Check setter function with direct array assignment
        expect(content).toContain('function setGetMultiArrayReturn(Order[][2] memory _value0)');
        expect(content).toContain('delete _getMultiArrayReturn_0');
        expect(content).toContain('for(uint i = 0; i < 2; i++)');
        expect(content).toContain('_getMultiArrayReturn_0[i][j] = _value0[i][j]');

        // Add more specific checks for storage and setter
        expect(content).toContain('Order[][2] private _getMultiArrayReturn_0');
        expect(content).toContain('function setGetMultiArrayReturn(Order[][2] memory _value0)');
    });

    test('should handle nested structs', () => {
        const abi = [
            {
                "inputs": [
                    {
                        "components": [
                            {
                                "components": [
                                    { "name": "value", "type": "uint256" }
                                ],
                                "internalType": "struct A",
                                "name": "x",
                                "type": "tuple"
                            },
                            { "name": "c", "type": "uint256" }
                        ],
                        "internalType": "struct B",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "name": "processNestedStruct",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];

        generateMock(abi, outputDirectory, 'ContractMock7');

        const mockPath = path.join(outputDirectory, 'ContractMock7.sol');
        const content = fs.readFileSync(mockPath, 'utf8');

        // Check that both struct definitions exist
        expect(content).toContain('struct A {');
        expect(content).toContain('uint256 value;');
        expect(content).toContain('struct B {');
        expect(content).toContain('A x;');
        expect(content).toContain('uint256 c;');

        // Check function signature
        expect(content).toContain('function processNestedStruct(B memory data)');
    });

    test('should handle complex nested types with arrays and structs', () => {
        const abi = [
            {
                "inputs": [
                    {
                        "components": [
                            {
                                "components": [
                                    { "name": "value", "type": "uint256" },
                                    { "name": "validated", "type": "bool" },
                                    { "name": "tags", "type": "string[]" }
                                ],
                                "internalType": "struct ValidationInfo",
                                "name": "validation",
                                "type": "tuple"
                            },
                            { "name": "timestamp", "type": "uint256" },
                            {
                                "components": [
                                    { "name": "x", "type": "uint256" },
                                    { "name": "y", "type": "uint256" }
                                ],
                                "internalType": "struct Point[]",
                                "name": "coordinates",
                                "type": "tuple[]"
                            }
                        ],
                        "internalType": "struct ComplexInput",
                        "name": "input",
                        "type": "tuple"
                    }
                ],
                "name": "processComplexData",
                "outputs": [
                    {
                        "components": [
                            {
                                "components": [
                                    { "name": "id", "type": "uint256" },
                                    { "name": "data", "type": "bytes" }
                                ],
                                "internalType": "struct ResultData[2]",
                                "name": "results",
                                "type": "tuple[2]"
                            },
                            { "name": "success", "type": "bool" },
                            {
                                "components": [
                                    { "name": "code", "type": "uint8" },
                                    { "name": "message", "type": "string" }
                                ],
                                "internalType": "struct Status[]",
                                "name": "statuses",
                                "type": "tuple[]"
                            }
                        ],
                        "internalType": "struct ComplexOutput",
                        "name": "",
                        "type": "tuple"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ];

        generateMock(abi, outputDirectory, 'ContractMock9');

        const mockPath = path.join(outputDirectory, 'ContractMock9.sol');
        const content = fs.readFileSync(mockPath, 'utf8');

        // Check all struct definitions exist
        expect(content).toContain('struct ValidationInfo {');
        expect(content).toContain('uint256 value;');
        expect(content).toContain('bool validated;');
        expect(content).toContain('string[] tags;');

        expect(content).toContain('struct Point {');
        expect(content).toContain('uint256 x;');
        expect(content).toContain('uint256 y;');

        expect(content).toContain('struct ComplexInput {');
        expect(content).toContain('ValidationInfo validation;');
        expect(content).toContain('uint256 timestamp;');
        expect(content).toContain('Point[] coordinates;');

        expect(content).toContain('struct ResultData {');
        expect(content).toContain('uint256 id;');
        expect(content).toContain('bytes data;');

        expect(content).toContain('struct Status {');
        expect(content).toContain('uint8 code;');
        expect(content).toContain('string message;');

        expect(content).toContain('struct ComplexOutput {');
        expect(content).toContain('ResultData[2] results;');
        expect(content).toContain('bool success;');
        expect(content).toContain('Status[] statuses;');

        // Check function signatures
        expect(content).toContain('function processComplexData(ComplexInput memory input)');
        expect(content).toContain('returns (ComplexOutput memory)');

        // Check storage variable
        expect(content).toContain('ComplexOutput private _processComplexDataReturn_0');

        // Check setter function
        expect(content).toContain('function setProcessComplexDataReturn(ComplexOutput memory _value0)');
    });
});