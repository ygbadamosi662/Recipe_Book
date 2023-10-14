import jwtDecode from "jwt-decode";

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

export const getToken = () => {
  const jwt = localStorage.getItem('jwt');
  if (jwt) {
    if (isExpired(jwt) === true) {
      localStorage.removeItem('jwt');
      return null;
    }

    return JSON.parse(jwt);
    
  }
  return jwt;
};

export const setToken = (jwt) => {
  if (jwt) {
    localStorage.setItem('jwt', JSON.stringify(jwt));
  }
  else {
    localStorage.removeItem('jwt');
  }
};

export const isExpired = (jwt) => {
  try {
    const decoded = decodeToken(jwt);
    const milliseconds = decoded.exp * 1000;
    return Date.now() > milliseconds;
  } catch (err) {
    console.log(err);
    return true;
  }
};

export const decodeToken = (jwt) => {
  try {
    return jwtDecode(jwt);
  } catch (error) {
    console.log(error)
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('jwt');
};
