export class DecodeContext {
  public view: DataView;
  private offset: number = 0;

  constructor(buffer: Uint8Array | ArrayBufferLike) {
    this.view = new DataView(
      buffer instanceof Uint8Array ? buffer.buffer : buffer
    );
  }

  read(bits: number): number {
    const curr = this.offset;
    const bytes = Math.floor(bits / 8);

    this.offset += bytes;
    if (this.offset > this.view.byteLength)
      throw new Error(`DecodeContext overflowed`);

    return curr;
  }

  static from(context: Uint8Array | DecodeContext): DecodeContext {
    if (context instanceof Uint8Array) return new DecodeContext(context);
    return context;
  }
}
