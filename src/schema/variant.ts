import { DecodeContext } from "../decode-context";
import { EncodeContext } from "../encode-context";
import { SchemaBase } from "./base";

type MapParameters<
  T extends (string | SchemaBase)[],
  U extends Record<string, SchemaBase>
> = {
  [K in keyof T]: T[K] extends string
    ? T[K] extends keyof U
      ? U[T[K]]["infer"]
      : never
    : // @ts-expect-error
      T[K]["infer"];
};

export interface VariantMember<
  N extends string,
  T extends (string | SchemaBase)[],
  U extends Record<string, SchemaBase>
> {
  (...value: MapParameters<T, U>): { id: N; values: MapParameters<T, U> };
}

type GetValues<T> = T[keyof T];

type GetAllGenerics<T extends Record<string, (string | SchemaBase)[]>> =
  GetValues<{
    [K in keyof T]: keyof {
      [U in T[K][number] as U extends SchemaBase ? never : U]: 1;
    };
  }>;

export class VariantSchema<
  T extends Record<string, (string | SchemaBase)[]>,
  U extends Record<string, SchemaBase> = {}
> implements SchemaBase
{
  public infer: {
    [K in keyof T]: { id: K & string; values: MapParameters<T[K], U> };
  }[keyof T] = null as any;
  private keys: (keyof T)[] = [];

  constructor(private members: T, private generics: U) {
    this.keys = Object.keys(members);
  }

  public encode(value: this["infer"], ctx?: EncodeContext): Uint8Array {
    ctx ??= new EncodeContext();

    const field = this.members[value.id];

    if (!field)
      throw new Error(`variant member '${value.id}' hasn't been defined`);

    if (field.length !== value.values.length)
      throw new Error(`not enough values specified for '${value.id}'`);

    ctx.view.setUint8(ctx.alloc(8), this.keys.indexOf(value.id));

    for (let i = 0; i < field.length; i++) {
      let curr = field[i];

      if (typeof curr === "string") {
        if (!(curr in this.generics))
          throw new Error(`generic '${curr}' hasn't been defined. Make sure to bind all generics to a type using .get(...)`);

        curr = this.generics[curr];
      }

      curr.encode(value.values[i], ctx);
    }

    return ctx.getArray();
  }

  public decode(buffer: Uint8Array | DecodeContext): this["infer"] {
    const ctx = DecodeContext.from(buffer);

    const id = ctx.view.getUint8(ctx.read(8));

    if (id >= this.keys.length || id < 0)
      throw new Error("invalid key into variant");

    const key = this.keys[id];
    const member = this.members[key];
    const values = [];

    for (const field of member) {
      let curr = field;

      if (typeof curr === "string") {
        if (!(curr in this.generics))
          throw new Error(`generic '${curr}' hasn't been defined. Make sure to bind all generics to a type using .get(...)`);

        curr = this.generics[curr];
      }

      values.push(curr.decode(ctx));
    }

    return { id: key, values } as any;
  }

  public get<U extends Record<GetAllGenerics<T>, SchemaBase>>(
    generics: U
  ): { [K in keyof T]: VariantMember<K & string, T[K], U> } & VariantSchema<
    T,
    U
  > {
    const out = new VariantSchema(this.members, generics);

    for (const key in this.members) {
      (out as any)[key] = (...values: any[]) => ({ id: key, values });
    }

    return out as any;
  }
}
