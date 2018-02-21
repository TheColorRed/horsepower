namespace hp {
  export function createDeepProxy<T extends Object>(target: any, handler: ProxyHandler<T>) {
    const preproxy = new WeakMap();

    function makeHandler(path: any) {
      return {
        set(target: any, key: string, value: any, receiver: any) {
          if (typeof value === 'object') {
            value = proxify(value, [...path, key]);
          }
          target[key] = value;
          if (handler.set) {
            handler.set(target, <any>[...path, key], value, receiver);
          }
          return true;
        },
        deleteProperty(target: any, key: any) {
          if (Reflect.has(target, key)) {
            unproxy(target, key);
            let deleted = Reflect.deleteProperty(target, key);
            if (deleted && handler.deleteProperty) {
              handler.deleteProperty(target, <any>[...path, key]);
            }
            return deleted;
          }
          return false;
        }
      }
    }

    function unproxy(obj: any, key: any) {
      if (preproxy.has(obj[key])) {
        // console.log('unproxy',key);
        obj[key] = preproxy.get(obj[key]);
        preproxy.delete(obj[key]);
      }

      for (let k of Object.keys(obj[key])) {
        if (typeof obj[key][k] === 'object') {
          unproxy(obj[key], k);
        }
      }

    }

    function proxify(obj: any, path: any) {
      for (let key of Object.keys(obj)) {
        if (typeof obj[key] === 'object') {
          obj[key] = proxify(obj[key], [...path, key]);
        }
      }
      let p = new Proxy(obj, makeHandler(path));
      preproxy.set(p, obj);
      return p;
    }

    return proxify(target, []);
  }

}