import { MappingRegistry, ValidationResult } from './types';
export declare function loadRegistry(registryDir?: string): MappingRegistry;
export declare function extendRegistry(base: MappingRegistry, extension: Partial<MappingRegistry>): MappingRegistry;
export declare function validateRegistry(registry: MappingRegistry): ValidationResult;
//# sourceMappingURL=registry-loader.d.ts.map