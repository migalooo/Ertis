import parseHDR from 'parse-hdr';
import ImageData from '../core/ImageData';

export default function HdrLoader(src): Promise<ImageData> {
  return new Promise((resolve: (image) => void, reject: (status) => void) => {
    const req = new XMLHttpRequest();
    req.responseType = 'arraybuffer';
    req.onreadystatechange = () => {
      if (req.readyState !== 4) return;
      if (req.readyState === 4 && req.status === 200) {
        const hdr = parseHDR(req.response);
        const image = new ImageData(hdr.shape[0], hdr.shape[1], hdr.data);
        resolve(image);
      } else {
        reject(req.status);
      }
    };
    req.open('GET', src, true);
    req.send();
  });
}
