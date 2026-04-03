/**
 * Pick specified keys from object
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
}

/**
 * Omit specified keys from object
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj } as any;
  keys.forEach(key => delete result[key]);
  return result;
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target };
  
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      output[key] = deepMerge(target[key] as any, source[key] as any);
    } else {
      output[key] = source[key] as any;
    }
  }
  
  return output;
}

/**
 * Get nested value from object using dot notation
 */
export function getValue<T>(obj: any, path: string, defaultValue?: T): T | undefined {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return (result === undefined ? defaultValue : result) as T;
}

/**
 * Set nested value in object using dot notation
 */
export function setValue(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const lastObj = keys.reduce((obj, key) => {
    if (!(key in obj)) {
      obj[key] = {};
    }
    return obj[key];
  }, obj);
  
  lastObj[lastKey] = value;
  return obj;
}

/**
 * Flatten object with dot notation
 */
export function flatten(obj: any, prefix: string = ''): Record<string, any> {
  return Object.keys(obj).reduce((acc, key) => {
    const pre = prefix.length ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flatten(obj[key], pre));
    } else {
      acc[pre] = obj[key];
    }
    
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Unflatten object from dot notation
 */
export function unflatten(obj: Record<string, any>): any {
  const result: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    setValue(result, key, value);
  }
  
  return result;
}

/**
 * Compare two objects deeply
 */
export function isEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!isEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

/**
 * Map object keys
 */
export function mapKeys<T>(obj: T, fn: (key: string) => string): T {
  return Object.fromEntries(
    Object.entries(obj as any).map(([key, value]) => [fn(key), value])
  ) as T;
}

/**
 * Map object values
 */
export function mapValues<T extends object, U>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => U
): Record<keyof T, U> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value as T[keyof T], key as keyof T)])
  ) as Record<keyof T, U>;
}

/**
 * Filter object by predicate
 */
export function filterObject<T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => predicate(value as T[keyof T], key as keyof T))
  ) as Partial<T>;
}