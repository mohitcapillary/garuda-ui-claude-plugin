export type MappingErrorCode = 'REGISTRY_INVALID' | 'NODE_NOT_FOUND' | 'FIGMA_API_ERROR' | 'CIRCULAR_REFERENCE';
export declare class MappingError extends Error {
    readonly code: MappingErrorCode;
    readonly context?: Record<string, unknown>;
    constructor(code: MappingErrorCode, message: string, context?: Record<string, unknown>);
}
//# sourceMappingURL=errors.d.ts.map