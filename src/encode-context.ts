export class EncodeContext {
  public view: DataView;
  private array: Uint8Array;
  private offset: number = 0;

  constructor(maxLength?: number) {
    this.array = new Uint8Array(maxLength ?? 1_000_000);
    this.view = new DataView(this.array.buffer);
  }

  alloc(bits: number): number {
    const curr = this.offset;
    const bytes = Math.floor(bits / 8);

    this.offset += bytes;
    if (this.offset > this.array.length)
      throw new Error(`EncodeContext overflowed`);

    return curr;
  }

  getArray() {
    return this.array.slice(0, this.offset);
  }
}
