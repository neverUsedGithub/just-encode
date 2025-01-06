import { DecodeContext } from "../decode-context";
import { EncodeContext } from "../encode-context";
import { SchemaBase } from "./base";

type MapItems<
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

type MapValue<
  T extends string | SchemaBase,
  U extends Record<string, SchemaBase>
> = T extends string
  ? T extends keyof U
    ? U[T]["infer"]
    : never
  : // @ts-expect-error
    T["infer"];

type MapValues<
  T extends Record<string, string | SchemaBase>,
  U extends Record<string, SchemaBase>
> = {
  [K in keyof T]: MapValue<T[K], U>;
};

export type VariantMember<
  N extends string,
  T extends VariantEntry,
  U extends Record<string, SchemaBase>,
  I = T extends (string | SchemaBase)[] ? MapItems<T, U> : never,
  V = T extends Record<string, string | SchemaBase> ? MapValues<T, U> : never
> = T extends (string | SchemaBase)[]
  ? I extends any[]
    ? (...value: I) => { id: N; values: I }
    : never
  : V extends Record<string, any>
  ? (value: V) => { id: N; values: V }
  : never;

export type VariantEntry =
  | (string | SchemaBase)[]
  | Record<string, string | SchemaBase>;

type GetValues<T> = T[keyof T];
type FilterGenerics<T extends (string | SchemaBase)[]> = {
  [K in keyof T]: T[K] extends string ? T[K] : never;
};

type GetAllGenerics<T extends Record<string, VariantEntry>> = GetValues<{
  [K in keyof T]: T[K] extends (string | SchemaBase)[]
    ? FilterGenerics<T[K]>[number]
    : T[K] extends Record<string, string | SchemaBase>
    ? GetValues<{
        [Z in keyof T[K]]: T[K][Z] extends string ? T[K][Z] : never;
      }>
    : never;
}>;

export class VariantSchema<
  T extends Record<string, VariantEntry>,
  U extends Record<string, SchemaBase> = {},
  G extends string = GetAllGenerics<T>
> implements SchemaBase
{
  public infer: {
    [K in keyof T]: {
      id: K & string;
      values: T[K] extends any[]
        ? MapItems<T[K], U>
        : T[K] extends Record<string, string | SchemaBase>
        ? MapValues<T[K], U>
        : never;
    };
  }[keyof T] = null as any;
  private keys: (keyof T)[] = [];

  constructor(private members: T, private generics: U) {
    this.keys = Object.keys(members);

    for (const key in this.members) {
      (this as any)[key] = Array.isArray(this.members[key])
        ? (...values: any[]) => ({ id: key, values })
        : (value: any) => ({ id: key, values: value });
    }
  }

  public encode(value: this["infer"], ctx?: EncodeContext): Uint8Array {
    ctx ??= new EncodeContext();

    const field = this.members[value.id];

    if (!field)
      throw new Error(`variant member '${value.id}' hasn't been defined`);

    ctx.view.setUint8(ctx.alloc(8), this.keys.indexOf(value.id));

    if (Array.isArray(field) && Array.isArray(value.values)) {
      if (field.length !== value.values.length)
        throw new Error(`not enough values specified for '${value.id}'`);

      for (let i = 0; i < field.length; i++) {
        let curr = field[i];

        if (typeof curr === "string") {
          if (!(curr in this.generics))
            throw new Error(
              `generic '${curr}' hasn't been defined. Make sure to bind all generics to a type using .get(...)`
            );

          curr = this.generics[curr];
        }

        curr.encode(value.values[i], ctx);
      }
    } else if (
      !Array.isArray(field) &&
      !Array.isArray(value.values) &&
      typeof field === "object" &&
      typeof value.values === "object"
    ) {
      for (const key in field) {
        // @ts-expect-error
        let curr: string | SchemaBase = field[key];

        if (typeof curr === "string") {
          if (!(curr in this.generics))
            throw new Error(
              `generic '${curr}' hasn't been defined. Make sure to bind all generics to a type using .get(...)`
            );

          curr = this.generics[curr];
        }

        if (!(key in value.values))
          throw new Error(
            `missing key '${key}' in variant value (branch '${value.id}')`
          );

        curr.encode(value.values[key as keyof typeof value.values], ctx);
      }
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
    let values!: any[] | Record<string, any>;

    if (Array.isArray(member)) {
      values = [];

      for (const field of member) {
        let curr = field;

        if (typeof curr === "string") {
          if (!(curr in this.generics))
            throw new Error(
              `generic '${curr}' hasn't been defined. Make sure to bind all generics to a type using .get(...)`
            );

          curr = this.generics[curr];
        }

        values.push(curr.decode(ctx));
      }
    } else if (typeof member === "object") {
      values = {};

      for (const field in member) {
        // @ts-expect-error
        let curr: string | SchemaBase = member[field];

        if (typeof curr === "string") {
          if (!(curr in this.generics))
            throw new Error(
              `generic '${curr}' hasn't been defined. Make sure to bind all generics to a type using .get(...)`
            );

          curr = this.generics[curr];
        }

        values[field] = curr.decode(ctx);
      }
    }

    return { id: key, values } as any;
  }

  public get<U extends Record<G, SchemaBase>>(
    generics: U
  ): { [K in keyof T]: VariantMember<K & string, T[K], U> } & VariantSchema<
    T,
    U
  > {
    return new VariantSchema(this.members, generics) as any;
  }
}
