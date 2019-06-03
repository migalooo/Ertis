import Vector2 from '../math/Vector2';
import Vector3 from '../math/Vector3';
export function flatten(arr: any /* [number[] | Vector3[] | Vector2[]] */) {
  return arr.reduce((a, b) => {
    if (b instanceof Vector2 || b instanceof Vector3) {
      return a.concat(...b.v);
    }
    return a.concat(b);
  }, []);
}
