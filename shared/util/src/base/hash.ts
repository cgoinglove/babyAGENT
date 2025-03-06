import { isObject } from "./util";

const table = new WeakMap<object, string>();

let cursor = 0;

export const stableHash = (arg: any): string => {
  const type = typeof arg;
  const isDate = arg instanceof Date;

  let result: string;

  if (!isDate && isObject(arg) && !(arg instanceof RegExp)) {
    result = table.get(arg)!;
    if (result) return result;
    result = "~" + cursor++;

    if (Array.isArray(arg)) result = "@[" + arg.map(stableHash).join(",") + "]";
    if (arg?.constructor === Object)
      result =
        "#{" +
        Object.keys(arg)
          .sort()
          .reduce((prev, key) => {
            const value = (arg as Record<string, any>)[key];
            // for normalization
            if (value == undefined) return prev;
            return prev + `${key}:${stableHash(value)}`;
          }, "") +
        "}";
    table.set(arg, result);

    return result;
  }

  if (isDate) return (arg as Date).toJSON();
  if (type === "symbol") return (arg as Symbol).toString();
  if (type === "string") return JSON.stringify(arg);
  return "" + arg;
};

export const equla = (a?: any, b?: any): boolean =>
  stableHash(a) === stableHash(b);
