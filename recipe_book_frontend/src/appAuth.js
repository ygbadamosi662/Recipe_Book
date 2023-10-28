import jwtDecode from "jwt-decode";

/**
* Handles Jwt
* @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
*/

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

export const getToken = () => {
  const jwt = localStorage.getItem('Jwt');
  return jwt;
};

export const setToken = (jwt) => {
  if (jwt) {
    localStorage.setItem('Jwt', jwt);
  }
  else {
    localStorage.removeItem('Jwt');
  }
};

export const isExpired = () => {
  try {
    const token = getToken();
    if(token) {
      const decoded = decodeToken(token);
      const milliseconds = decoded.exp * 1000;
      return Date.now() > milliseconds;
    }
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

export const removeToken = () => {
  localStorage.removeItem('Jwt');
};
