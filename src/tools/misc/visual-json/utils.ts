export interface Item {
  name: string;
  type: 'string' | 'number' | 'object' | 'array' | 'boolean' | 'null';
  value?: string | number | boolean | null;
}

export function getItemsFromPath(obj: any, objPath: string) {
  const root = resolvePath(obj, objPath);
  const items: Item[] = [];

  if (Array.isArray(root)) {
    for (let i = 0; i < root.length; i++) {
      const element = root[i];
  
      const item: Item = { name: i.toString() } as any;
      switch (typeof element) {
        case 'string':
          item.type = 'string';
          item.value = element;
          break;
        case 'number':
          item.type = 'number';
          item.value = element;
          break;
        case 'boolean':
          item.type = 'boolean';
          item.value = element;
          break;
        case 'object':
          if (element === null) {
            item.type = 'null';
            item.value = null;
          } else if (Array.isArray(element)) {
            item.type = 'array';
          } else {
            item.type = 'object';
          }
          break;
      }
  
      items.push(item);
    }
  } else {
    for (const key of Object.keys(root)) {
      const element = root[key];
  
      const item: Item = { name: key } as any;
      switch (typeof element) {
        case 'string':
          item.type = 'string';
          item.value = element;
          break;
        case 'number':
          item.type = 'number';
          item.value = element;
          break;
        case 'boolean':
          item.type = 'boolean';
          item.value = element;
          break;
        case 'object':
          if (element === null) {
            item.type = 'null';
            item.value = null;
          } else if (Array.isArray(element)) {
            item.type = 'array';
          } else {
            item.type = 'object';
          }
          break;
      }
  
      items.push(item);
    }
  }

  return items;
}

export function resolvePath(obj: any, objPath: string) {
  if (objPath.charAt(0) !== '/') objPath = '/' + objPath;
  const split = objPath.replace(/^\//, '').split('/');

  let root = obj;
  const shouldSkip = split.length === 1 && split[0] === '';

  if (!shouldSkip) {
    for (let i = 0; i < split.length; i++) {
      const element = split[i];
      if (element in root) {
        root = root[element];
      } else {
        return [];
      }
    }
  
    if (typeof root !== 'object') return null;
  }

  return root;
}

export function mutatePath(obj: any, objPath: string, update: any) {
  if (objPath.charAt(0) !== '/') objPath = '/' + objPath;
  const split = objPath.replace(/^\//, '').split('/');

  let root = obj;
  const shouldSkip = split.length === 1 && split[0] === '';

  if (!shouldSkip) {
    for (let i = 0; i < split.length; i++) {
      const element = split[i];
      if (element in root) {
        if (i === split.length - 1) {
          root[element] = update;
          return root;
        } else {
          root = root[element];
        }
      } else {
        return false;
      }
    }
  
    if (typeof root !== 'object') return false;
  } else {
    return update;
  }

  return root;
}

export const renameObjKey = (oldObj: any, oldKey: any, newKey: any) => {
  const keys = Object.keys(oldObj);
  const newObj = keys.reduce((acc: any, val)=>{
    if(val === oldKey){
        acc[newKey] = oldObj[oldKey];
    }
    else {
        acc[val] = oldObj[val];
    }
    return acc;
  }, {});

  return newObj;
};