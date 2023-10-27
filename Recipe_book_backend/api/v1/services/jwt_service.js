/**
 * Contains the JwtService class
 * handles all jwt operations
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */
const jwt = require('jsonwebtoken');
const { db_storage } = require('../models/engine/db_storage');
require('dotenv').config();

class JwtService {
  constructor (){
    this._expiresIn = '1h';
    this._token = '';
  }

  async generate_token(payload) {
    try {
      const token = await jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: this._expiresIn });
      return token;
    } catch (error) {
      throw error;
    }
  }

}

const authenticate_token = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token part

    // if token is absent
    if (!token) {
      return res
        .status(401)
        .json({
          jwt: 'Token required'
        });
    }

    // if token has logged out
    const jwt_token = await db_storage.get_jwt(token);
    if (jwt_token) {
      return res
      .status(401)
      .json({ jwt: 'Token logged out, login again' });
    }

    // if token is valid
    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) {
        return res.status(401).json({ jwt: 'Token expired, login again'}); // Forbidden
      }
      req.user = user;
      next();
    });
  } catch (error) {
    throw error;
  }
}

const jwt_service = new JwtService(); 

module.exports = { jwt_service, authenticate_token };
