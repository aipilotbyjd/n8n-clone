export class Connection {
  private _sourceNodeId: string;
  private _targetNodeId: string;
  private _sourceOutputIndex: number;
  private _targetInputIndex: number;

  constructor(
    sourceNodeId: string,
    targetNodeId: string,
    sourceOutputIndex: number = 0,
    targetInputIndex: number = 0
  ) {
    this._sourceNodeId = sourceNodeId;
    this._targetNodeId = targetNodeId;
    this._sourceOutputIndex = sourceOutputIndex;
    this._targetInputIndex = targetInputIndex;
  }

  get sourceNodeId(): string {
    return this._sourceNodeId;
  }

  get targetNodeId(): string {
    return this._targetNodeId;
  }

  get sourceOutputIndex(): number {
    return this._sourceOutputIndex;
  }

  get targetInputIndex(): number {
    return this._targetInputIndex;
  }

  equals(other: Connection): boolean {
    return (
      this._sourceNodeId === other._sourceNodeId &&
      this._targetNodeId === other._targetNodeId &&
      this._sourceOutputIndex === other._sourceOutputIndex &&
      this._targetInputIndex === other._targetInputIndex
    );
  }
}
