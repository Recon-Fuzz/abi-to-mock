const isBrowser = typeof window !== 'undefined';

// Import Node.js modules conditionally
const nodeModules = !isBrowser ? {
  path: require('path'),
  fs: require('fs')
} : {
  path: null as typeof import('path') | null,
  fs: null as typeof import('fs') | null
};

import * as Handlebars from 'handlebars';
import mockTemplate from '../templates/mock';

import {
  AbiInput,
  AbiFunction,
  AbiEvent,
  Struct,
  MockData,
  MockContract
} from '../types';

// Helper functions for type processing
function processType(param: AbiInput): string {
  const type = param.type;
  if (type.startsWith('tuple')) {
    return param.internalType?.replace('struct ', '').replace(".","_") || type;
  }
  return type;
}

function getStructName(functionName: string, paramName: string): string {
  return `${functionName}${paramName.charAt(0).toUpperCase() + paramName.slice(1)}Struct`;
}

function processABI(abi: any[]): { functions: AbiFunction[], events: AbiEvent[], receive?: AbiFunction, fallback?: AbiFunction } {
  // First pass: Count occurrences of each function name to detect overloads
  const functionNameCount: Record<string, number> = {};
  
  abi.filter(item => item.type === 'function').forEach(func => {
    const name = func.name;
    functionNameCount[name] = (functionNameCount[name] || 0) + 1;
  });
  
  // Second pass: Only assign overloadIndex to functions that have name conflicts
  const processedFunctions: Record<string, number> = {};
  
  const functions = abi.filter(item => item.type === 'function').map(func => {
    const name = func.name;
    const hasOverloads = functionNameCount[name] > 1;
    let overloadIndex: number | undefined = undefined;
    
    if (hasOverloads) {
      // Only assign index if this function name has overloads
      processedFunctions[name] = (processedFunctions[name] || 0);
      overloadIndex = processedFunctions[name]++;
    }
    
    return {
      name: func.name,
      inputs: func.inputs || [],
      outputs: func.outputs || [],
      stateMutability: func.stateMutability,
      type: 'function',
      overloadIndex // Will be undefined for non-overloaded functions
    };
  });

  const fallback = abi.find(item => item.type === 'fallback');

  const receive = abi.find(item => item.type === 'receive');

  const events = abi.filter(item => item.type === 'event').map(event => ({
    name: event.name,
    inputs: event.inputs || [],
    anonymous: event.anonymous,
    type: 'event'
  }));

  return { functions, events, receive, fallback };
}

function isStructType(type: string, internalType?: string): boolean {
  return Boolean(type?.startsWith('tuple')) || /^tuple(?:\[\d*\])+$/.test(type) || 
         Boolean(internalType && internalType.startsWith('struct '));
}

function processStructs(abi: any[]): Struct[] {
  const structs = new Map<string, AbiInput[]>();

  function processComponents(components: AbiInput[], functionName: string, paramName: string): void {
    components.forEach(component => {
      if (isStructType(component.type, component.internalType)) {
        const structName = component.internalType?.replace('struct ', '').replace(/\[\d*\]/g, '').replace(".","_") || 
                           getStructName(functionName, component.name || paramName);
        
        if (!structs.has(structName) && component.components) {
          structs.set(structName, component.components);
          // Recursively process nested structs
          processComponents(component.components, functionName, component.name || paramName);
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
        const structName = param.internalType?.replace('struct ', '').replace(/\[\d*\]/g, '').replace(".","_") || 
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
      name: comp.name || `param${Math.random().toString(36).substr(2, 9)}`
    }))
  }));
}

// Register Handlebars helpers
Handlebars.registerHelper('capitalize', str => str.charAt(0).toUpperCase() + str.slice(1));

Handlebars.registerHelper('processType', (param: AbiInput) => {
  return processType(param);
});

// Add new helper to detect array types
Handlebars.registerHelper('isArrayType', function(type: string) {
  return type.includes('[]') || /\[\d+\]/.test(type);
});

// Add helper to detect multi-dimensional arrays
Handlebars.registerHelper('isMultiArray', function(type: string) {
  const matches = type.match(/\[\d*\]/g);
  return matches && matches.length > 1;
});

// Add helper to detect fixed-size arrays
Handlebars.registerHelper('isFixedArray', function(type: string) {
  return /\[\d+\]/.test(type);
});

// Add helper to get fixed array length
Handlebars.registerHelper('getFixedArrayLength', function(type: string) {
  const match = type.match(/\[(\d+)\]/);
  return match ? match[1] : '0';
});

// Update helper to get array dimensions with proper formatting
Handlebars.registerHelper('getDimIndices', function(type: string) {
  const dimensions = type.match(/\[\d*\]/g) || [];
  return dimensions.map((_, index) => `uint i${index}`).join(', ');
});

Handlebars.registerHelper('getArrayAccessors', function(type: string) {
  const dimensions = type.match(/\[\d*\]/g) || [];
  return dimensions.map((_, index) => `[i${index}]`).join('');
});

// Update memoryKeyword helper to handle all reference types
Handlebars.registerHelper('memoryKeyword', (type: string) => {
  // Check for array dimensions (both fixed and dynamic)
  const hasArrayDimension = /(\[\d*\])+$/.test(type);
  // Check if it's a fixed-size bytes type (bytes1 through bytes32)
  const isFixedBytes = /^bytes(?:[1-9]|[12]\d|3[0-2])$/.test(type);
  // Check if type contains common reference types
  const isReferenceType = type.includes('string') || 
                         hasArrayDimension || 
                         (type === 'bytes') || // only dynamic bytes gets memory
                         !type.match(/^(address|bool|u?int\d*|bytes\d+)$/);
  return (isReferenceType && !isFixedBytes) ? ' memory' : '';
});

// Update isStruct helper (can be removed as it's now handled by memoryKeyword)
Handlebars.registerHelper('isStruct', function(type: string) {
  return !type.match(/^(address|bool|u?int\d*|bytes\d+)$/);
});

// Add helper to get the element type of an array
Handlebars.registerHelper('getElementType', function(type: string) {
  // Remove all array dimensions
  return type.replace(/\[\d*\]/g, '');
});

// Add helper to check if element type is a struct
Handlebars.registerHelper('isStructElementType', function(type: string) {
  const elementType = type.replace(/\[\d*\]/g, '');
  return !elementType.match(/^(address|bool|u?int\d*|bytes\d+)$/);
});

// Add helper to check if function has multiple outputs
Handlebars.registerHelper('hasMultipleOutputs', function(outputs: AbiInput[]) {
  return outputs && outputs.length > 1;
});

// Add helper to check equality
Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

export function generateMockString(
  abiInput: any[] | { abi: any[] },
  contractName: string = 'Contract'
): string {
  try {
    const abi = Array.isArray(abiInput) ? abiInput : abiInput?.abi;
  
    if (!Array.isArray(abi) || abi.length === 0) {
      return '';
    }

    const { functions, events, receive, fallback } = processABI(abi);
    const mockData: MockData = {
      contractName,
      structs: processStructs(abi),
      functions,
      events,
      receive,
      fallback
    };

    const template = Handlebars.compile(mockTemplate);
    return template(mockData);
  } catch (error) {
    console.error('Template compilation error:', error);
    throw error;
  }
}

export function generateMock(
  abiInput: any[] | { abi: any[] },
  outputDirectory: string,
  contractName: string = 'Contract'
): MockContract {
  if (isBrowser) {
    throw new Error('generateMock is not supported in browser environment. Use generateMockString instead.');
  }

  if (!nodeModules.path || !nodeModules.fs) {
    throw new Error('Node.js modules not available');
  }

  const { path, fs } = nodeModules;
  const mockContent = generateMockString(abiInput, contractName);
  
  // File system operations
  const outputDir = path.resolve(process.cwd(), outputDirectory);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, `${contractName}.sol`);
  fs.writeFileSync(outputPath, mockContent);

  // Return mock interface
  const abi = Array.isArray(abiInput) ? abiInput : abiInput?.abi;
  const { functions, events, receive, fallback } = processABI(abi || []);
  
  return {
    functions: functions.reduce<Record<string, () => void>>((acc, func) => {
      acc[func.name] = () => {};
      return acc;
    }, {}),
    events: events.reduce<Record<string, () => void>>((acc, event) => {
      acc[event.name] = () => {};
      return acc;
    }, {}),
    receive, 
    fallback
  };
}