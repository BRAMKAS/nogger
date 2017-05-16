export const endpoint = '/api/';

export default {
  get(path) {
    return window.fetch(endpoint + path, {
      jar: true,
      credentials: 'include',
    }).then((re) => {
      if (re.status === 200) {
        return re.json();
      }
      throw new Error(re.statusText);
    });
  },
  post(path, payload) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return window.fetch(endpoint + path, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers,
      jar: true,
      credentials: 'include',
    }).then((re) => {
      if (re.status === 200) {
        return re.json();
      }
      throw new Error(re.statusText);
    });
  },
};
