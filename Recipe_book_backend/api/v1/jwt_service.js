const jwt = require('jsonwebtoken');
const { db_storage } = require('./models/engine/db_storage');
require('dotenv').config();
/**
 * Contains the JwtService class
 * handles all jwt operations
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */
class JwtService {
  constructor (){
    this._jwt_key = process.env.JWT_SECRET;
    this._jwt = jwt;
    this._expiresIn = '1h';
    this._token = '';
  }

  generate_token(payload) {
    try {
      const token = this._jwt.sign(payload, this._jwt_key, { expiresIn: this._expiresIn });
      return token;
    } catch (error) {
      throw error;
    }
  }

}


const authenticate_token = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token part

  if (!token) {
    return res.status(401);
  }
  try {
    const jwt = await db_storage.get_jwt(token);
    if (jwt) {
      return res
      .status(400)
      .json({ message: 'Invalid token, User should log in again' });
    }
  } catch (error) {
    console.log('FS error', error);
  }
  
  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(401); // Forbidden
    }
    req.user = user;
    next();
  });
}
const jwt_service = new JwtService(); 

module.exports = { jwt_service, JwtService, authenticate_token };
