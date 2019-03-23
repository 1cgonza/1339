export default function (url) {
  return new Promise((resolve, reject) => {
    let req = new XMLHttpRequest();

    req.overrideMimeType('application/json');
    req.open('GET', url, true);

    req.onload = () => {
      if (req.status === 200) {
        resolve(JSON.parse(req.response));
      } else {
        reject(req.statusText);
      }
    };

    req.send();
  });
}
