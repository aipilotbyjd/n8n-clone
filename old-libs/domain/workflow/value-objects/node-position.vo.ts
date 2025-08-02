export class NodePosition {
  constructor(
    public readonly x: number,
    public readonly y: number
  ) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error('Node position coordinates must be finite numbers');
    }
  }

  // Business methods
  equals(other: NodePosition): boolean {
    return this.x === other.x && this.y === other.y;
  }

  distanceTo(other: NodePosition): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  moveBy(deltaX: number, deltaY: number): NodePosition {
    return new NodePosition(this.x + deltaX, this.y + deltaY);
  }

  moveTo(x: number, y: number): NodePosition {
    return new NodePosition(x, y);
  }

  isWithinBounds(minX: number, minY: number, maxX: number, maxY: number): boolean {
    return this.x >= minX && this.x <= maxX && this.y >= minY && this.y <= maxY;
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }

  toArray(): [number, number] {
    return [this.x, this.y];
  }

  toObject(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  // Static factory methods
  static origin(): NodePosition {
    return new NodePosition(0, 0);
  }

  static fromObject(obj: { x: number; y: number }): NodePosition {
    return new NodePosition(obj.x, obj.y);
  }

  static fromArray(coords: [number, number]): NodePosition {
    return new NodePosition(coords[0], coords[1]);
  }
}
