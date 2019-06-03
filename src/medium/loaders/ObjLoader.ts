import ObjParser from '../utils/ObjParser';
import FileLoader from './FileLoader';

export default function(file) {
  return new Promise((resolve, reject) => {
    FileLoader(file)
      .then(response => {
        const data = ObjParser(response);
        resolve(data);
      })
      .catch(reject);
  });
}
