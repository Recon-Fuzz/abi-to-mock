const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

// Helper functions for type processing
function processType(param) {
    const type = param.type;
    if (type.startsWith('tuple')) {
        return param.internalType.replace('struct ', '');
    }
    return type;
}

function getStructName(functionName, paramName) {
    return `${functionName}${paramName.charAt(0).toUpperCase() + paramName.slice(1)}Struct`;
}

function processABI(abi) {
    // Convert standard ABI format to our internal format
    const functions = abi.filter(item => item.type === 'function').map(func => ({
        name: func.name,
        inputs: func.inputs || [],
        outputs: func.outputs || [],
        stateMutability: func.stateMutability
    }));

    const events = abi.filter(item => item.type === 'event').map(event => ({
        name: event.name,
        inputs: event.inputs || [],
        anonymous: event.anonymous
    }));

    return { functions, events };
}

function isStructType(type, internalType) {
    return type.startsWith('tuple') || /^tuple(?:\[\d*\])+$/.test(type) || 
           (internalType && internalType.startsWith('struct '));
}

function processStructs(abi) {
    const structs = new Map();

    function processComponents(components, functionName, paramName) {
        components.forEach(component => {
            if (isStructType(component.type, component.internalType)) {
                const structName = component.internalType?.replace('struct ', '').replace(/\[\d*\]/g, '') || 
                                 getStructName(functionName, component.name || paramName);
                
                if (!structs.has(structName) && component.components) {
                    structs.set(structName, component.components);
                    // Recursively process nested structs
                    processComponents(component.components, functionName, component.name);
                }
            }
        });
    }

    // Process all ABI entries for structs
    abi.forEach(item => {
        const params = [
            ...(item.inputs || []),
            ...(item.outputs || [])
        ];

        params.forEach(param => {
            if (isStructType(param.type, param.internalType)) {
                const structName = param.internalType?.replace('struct ', '').replace(/\[\d*\]/g, '') || 
                                 getStructName(item.name, param.name || 'Return');
                
                if (!structs.has(structName) && param.components) {
                    structs.set(structName, param.components);
                    // Process nested structs
                    processComponents(param.components, item.name, param.name);
                }
            }
        });
    });

    return Array.from(structs.entries()).map(([name, components]) => ({
        name,
        fields: components.map(comp => ({
            type: processType(comp),
            name: comp.name
        }))
    }));
}

// Register Handlebars helpers
Handlebars.registerHelper('capitalize', str => str.charAt(0).toUpperCase() + str.slice(1));

Handlebars.registerHelper('processType', (param) => {
    return processType(param);
});

// Add new helper to detect array types
Handlebars.registerHelper('isArrayType', function(type) {
    return type.includes('[]') || /\[\d+\]/.test(type);
});

// Add helper to detect multi-dimensional arrays
Handlebars.registerHelper('isMultiArray', function(type) {
    const matches = type.match(/\[\d*\]/g);
    return matches && matches.length > 1;
});

// Add helper to detect fixed-size arrays
Handlebars.registerHelper('isFixedArray', function(type) {
    return /\[\d+\]/.test(type);
});

// Add helper to get fixed array length
Handlebars.registerHelper('getFixedArrayLength', function(type) {
    const match = type.match(/\[(\d+)\]/);
    return match ? match[1] : '0';
});

// Update memoryKeyword helper to handle all reference types
Handlebars.registerHelper('memoryKeyword', (type) => {
    // Check for array dimensions (both fixed and dynamic)
    const hasArrayDimension = /(\[\d*\])+$/.test(type);
    // Check if type contains common reference types
    const isReferenceType = type.includes('string') || 
                           hasArrayDimension || 
                           type.includes('bytes') || 
                           !type.match(/^(address|bool|u?int\d*|bytes\d+)$/);
    return isReferenceType ? ' memory' : '';
});

// Update isStruct helper (can be removed as it's now handled by memoryKeyword)
Handlebars.registerHelper('isStruct', function(type) {
    return !type.match(/^(address|bool|u?int\d*|bytes\d+)$/);
});

// Add helper to get the element type of an array
Handlebars.registerHelper('getElementType', function(type) {
    // Remove all array dimensions
    return type.replace(/\[\d*\]/g, '');
});

// Add helper to check if element type is a struct
Handlebars.registerHelper('isStructElementType', function(type) {
    const elementType = type.replace(/\[\d*\]/g, '');
    return !elementType.match(/^(address|bool|u?int\d*|bytes\d+)$/);
});

// Add helper to check if function has multiple outputs
Handlebars.registerHelper('hasMultipleOutputs', function(outputs) {
    return outputs && outputs.length > 1;
});

function generateMock(abiInput, outputDirectory, contractName = 'Contract') {
    // Handle both direct ABI array and object containing ABI
    const abi = Array.isArray(abiInput) ? abiInput : abiInput?.abi;
    
    if (!Array.isArray(abi) || abi.length === 0) {
        return {};
    }

    const { functions, events } = processABI(abi);

    // Add function context to all parameters
    functions.forEach(func => {
        func.inputs.forEach(input => input.functionName = func.name);
        func.outputs.forEach(output => output.functionName = func.name);
    });

    events.forEach(event => {
        event.inputs.forEach(input => input.functionName = event.name);
    });

    // Prepare template data with custom contract name
    const mockData = {
        contractName,
        structs: processStructs(abi),
        functions,
        events
    };

    // Read and compile template using absolute path from generator.js location
    const templatePath = path.resolve(__dirname, '../templates/mock.hbs');
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateContent);

    // Generate mock content
    const mockContent = template(mockData);

    // Use relative path from CWD for output
    const outputDir = path.resolve(process.cwd(), outputDirectory);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Create output file path relative to CWD
    const outputPath = path.join(outputDir, `${contractName}.sol`);
    fs.writeFileSync(outputPath, mockContent);

    return {
        functions: functions.reduce((acc, func) => {
            acc[func.name] = () => {};
            return acc;
        }, {}),
        events: events.reduce((acc, event) => {
            acc[event.name] = () => {};
            return acc;
        }, {})
    };
}

module.exports = { generateMock };
