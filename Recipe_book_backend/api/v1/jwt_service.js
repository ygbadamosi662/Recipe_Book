const jwt = require('jsonwebtoken');
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


const auth_token = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token part

  if (!token) {
    return res.sendStatus(401);
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    
    req.user = jwt.decode(token);
    next();
  });
}
const jwt_service = new JwtService(); 

module.exports = { jwt_service, JwtService, auth_token };
