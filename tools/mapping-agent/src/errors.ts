export type MappingErrorCode =
  | 'REGISTRY_INVALID'
  | 'NODE_NOT_FOUND'
  | 'FIGMA_API_ERROR'
  | 'CIRCULAR_REFERENCE';

export class MappingError extends Error {
  readonly code: MappingErrorCode;
  readonly context?: Record<string, unknown>;

  constructor(
    code: MappingErrorCode,
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MappingError';
    this.code = code;
    this.context = context;
    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, MappingError.prototype);
  }
}
