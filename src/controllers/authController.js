const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const VALID_USERNAME = 'customer-vietqrtest-user2468';
const VALID_PASSWORD = 'Y3VzdG9tZXItdmlldHFydGVzdC11c2VyMjQ2ODpZM1Z6ZEc5dFpYSXRkbWxsZEhGeWRHVnpkQzExYzJWeU1qUTJPQT09'; // Base64 của username:password
const SECRET_KEY = 'your-256-bit-secret'; // Secret key để ký JWT

exports.generateToken = (req, res) => {
    const { username, password } = req.body;
    const token = jwt.sign(
            { username }, 
            SECRET_KEY, 
            { algorithm: 'HS512', expiresIn: '5m' } // Token hết hạn sau 5 phút
        );

        // Trả về token
        res.json({
            access_token: token,
            token_type: 'Bearer',
            expires_in: 300 // 300 giây = 5 phút
        });
    // // Kiểm tra Authorization header
    // const authHeader = req.headers.authorization;
    // if (!authHeader || !authHeader.startsWith('Basic ')) {
    //     return res.status(400).json({ error: 'Authorization header is missing or invalid' });
    // }

    // // Giải mã Base64 từ Authorization header
    // const base64Credentials = authHeader.split(' ')[1];
    // const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    // const [username, password] = credentials.split(':');

    // // Kiểm tra username và password
    // if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    //     // Tạo JWT token
        
    // } else {
    //     res.status(401).json({ error: 'Invalid credentials' });
    // }
};
