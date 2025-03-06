type ElementType<T> = T extends (infer U)[] ? U : never;

type ValueOf<T extends object> = T[keyof T];

type Serializable =
  | string
  | number
  | boolean
  | null
  | SerializableArray
  | SerializableObject;

interface SerializableObject {
  [key: string]: Serializable;
}

interface SerializableArray extends Array<Serializable> {}

type PickPartial<T, U extends keyof T> = Omit<T, U> & Partial<Pick<T, U>>;
