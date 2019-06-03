import FileLoader from './FileLoader';

export default function(file) {
  return new Promise((resolve, reject) => {
    FileLoader(file)
      .then(response => {
        const data = JSON.parse(response);
        resolve(data);
      })
      .catch(reject);
  });
}
