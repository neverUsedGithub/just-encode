import type { SchemaBase } from "./base";

import { MapSchema } from "./map";
import {
  VariantSchema,
  type VariantEntry,
  type VariantMember,
} from "./variant";
import { ArraySchema } from "./array";
import { FloatSchema } from "./float";
import { StringSchema } from "./string";
import { StructSchema } from "./struct";
import { BufferSchema } from "./buffer";
import { BooleanSchema } from "./boolean";
import { IntegerSchema } from "./integer";
import { UIntegerSchema } from "./uinteger";

export const bool = new BooleanSchema();
export const string = new StringSchema();
export const i8 = new IntegerSchema("8");
export const i16 = new IntegerSchema("16");
export const i32 = new IntegerSchema("32");
export const i64 = new IntegerSchema("64");
export const u8 = new UIntegerSchema("8");
export const u16 = new UIntegerSchema("16");
export const u32 = new UIntegerSchema("32");
export const u64 = new UIntegerSchema("64");
export const f32 = new FloatSchema("32");
export const f64 = new FloatSchema("64");

export function map<T extends SchemaBase>(value: T) {
  return new MapSchema(value);
}

export function array<T extends SchemaBase>(item: T) {
  return new ArraySchema(item);
}

export function struct<T extends Record<string, SchemaBase>>(items: T) {
  return new StructSchema(items);
}

export function buffer(length: number) {
  return new BufferSchema(length);
}

export function variant<
  const T extends Record<string, VariantEntry>,
  U extends Record<string, SchemaBase> = {}
>(
  members: T,
  generics?: U
): { [K in keyof T]: VariantMember<K & string, T[K], U> } & VariantSchema<
  T,
  U
> {
  return new VariantSchema<T, U>(members, generics ?? ({} as any)).get(
    generics ?? ({} as any)
  ) as any;
}

export type { SchemaBase } from "./base";
export type { MapSchema } from "./map";
export type { VariantSchema, VariantEntry, VariantMember } from "./variant";
export type { ArraySchema } from "./array";
export type { FloatSchema } from "./float";
export type { StringSchema } from "./string";
export type { StructSchema } from "./struct";
export type { BufferSchema } from "./buffer";
export type { BooleanSchema } from "./boolean";
export type { IntegerSchema } from "./integer";
export type { UIntegerSchema } from "./uinteger";
