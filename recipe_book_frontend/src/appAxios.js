import axios from 'axios';

const appAx = axios.create({
  baseURL: 'http://127.0.0.1:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

appAx.defaults.headers.common['Access-Control-Allow-Origin'] = 'http://127.0.0.1:1245';

export const setAuthJwt = (jwt) => {
  if (jwt) {
    appAx.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
  } else {
    delete appAx.defaults.headers.common['Authorization'];
  }
};

export { appAx, setAuthJwt };
