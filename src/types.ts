export interface AbiInput {
  name?: string;
  type: string;
  internalType?: string;
  components?: AbiInput[];
  functionName?: string;
}

export interface AbiOutput extends AbiInput {}

export interface AbiFunction {
  name: string;
  inputs: AbiInput[];
  outputs: AbiOutput[];
  stateMutability?: string;
  type: string;
  overloadIndex?: number;
}

export interface AbiEvent {
  name: string;
  inputs: AbiInput[];
  anonymous?: boolean;
  type: string;
}

export interface Struct {
  name: string;
  fields: {
    type: string;
    name: string;
  }[];
}

export interface MockData {
  contractName: string;
  structs: Struct[];
  functions: AbiFunction[];
  events: AbiEvent[];
}

export interface MockContract {
  functions: Record<string, () => void>;
  events: Record<string, () => void>;
}