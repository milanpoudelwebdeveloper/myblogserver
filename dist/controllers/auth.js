"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.sendVerificationLink = exports.checkLogin = exports.logOutUser = exports.loginUser = exports.verifyAccount = exports.signUp = void 0;
const db_1 = __importDefault(require("../db"));
const generateJWTKey_1 = require("../globals/generateJWTKey");
const sendEmail_1 = require("../globals/sendEmail");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const clientUrl = process.env.CLIENT_URL;
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, email, password, country } = req.body;
    try {
        if (!name || !email || !password || !country) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const user = yield db_1.default.query('SELECT * FROM users WHERE email=$1', [email]);
        if ((_a = user === null || user === void 0 ? void 0 : user.rows) === null || _a === void 0 ? void 0 : _a.length) {
            return res.status(400).json({ message: 'This account already exists. Please sign or or use another email' });
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = bcrypt_1.default.hashSync(password, salt);
        const query = 'INSERT INTO users (name, email, password, country) VALUES ($1, $2, $3, $4) RETURNING *';
        const userCreated = yield db_1.default.query(query, [name, email, hashedPassword, country]);
        if (userCreated.rows.length > 0) {
            const token = (0, generateJWTKey_1.generateJWTKey)(userCreated.rows[0].id);
            const message = `Thank you for signing up with MyBlog. Please verify your account by clicking on the link below.
      ${clientUrl}/verifyaccount?token=${token}`;
            (0, sendEmail_1.sendEmail)(email, 'Welcome to MyBlog', message);
            return res.status(201).json({ message: 'User created successfully. Please check your email and verify account before loggin in' });
        }
        else {
            return res.status(500).json({ message: 'Something went wrong while signing up. Please try again' });
        }
    }
    catch (e) {
        console.log('hey error while signing up', e);
        return res.status(500).json({ message: 'Something went wrong while signing up. Please try again' });
    }
});
exports.signUp = signUp;
const verifyAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    try {
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded) {
            const query = 'UPDATE users SET verified=true WHERE id=$1';
            yield db_1.default.query(query, [decoded === null || decoded === void 0 ? void 0 : decoded.id]);
            if (decoded === null || decoded === void 0 ? void 0 : decoded.role) {
                const token = (0, generateJWTKey_1.generateJWTKey)(decoded.id);
                const finalUrl = `${clientUrl}/change-password?token=${token}`;
                return res.status(200).json({ message: 'Account verified successfully', redirectUrl: finalUrl });
            }
            else {
                return res.status(200).json({ message: 'Account verified successfully' });
            }
        }
        else {
            return res.status(400).json({ message: 'Invalid token' });
        }
    }
    catch (e) {
        console.log('hey error while verifying account', e);
        return res.status(500).json({ message: 'Something went wrong while verifying account. Please try again' });
    }
});
exports.verifyAccount = verifyAccount;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const query = 'SELECT DISTINCT * FROM users WHERE email=$1';
        const foundUser = yield db_1.default.query(query, [email]);
        if (foundUser.rows.length > 0) {
            const user = foundUser.rows[0];
            const isMatch = yield bcrypt_1.default.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    message: 'Incorrect password'
                });
            }
            else {
                const isVerified = user.verified;
                if (!isVerified) {
                    return res.status(400).json({
                        message: 'Account not verified. Please check your email for the verification link'
                    });
                }
                const payload = {
                    id: user.id,
                    role: user.role
                };
                const accessToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_ACCESS_KEY, { expiresIn: '10min' });
                const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_KEY, { expiresIn: '1d' });
                res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'none' });
                res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'none' });
                return res.status(201).json({
                    message: 'Logged in successfully',
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        country: user.country,
                        role: user.role,
                        profileimage: user.profileimage
                    }
                });
            }
        }
        else {
            return res.status(400).json({
                message: 'User with that email not found'
            });
        }
    }
    catch (e) {
        console.log('Hey something when wrong controller:loginUser', e);
        return res.status(500).json({ message: 'Something went wrong while logging in. Please try again' });
    }
});
exports.loginUser = loginUser;
const logOutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie('refreshToken', {
            secure: true,
            sameSite: 'none'
        });
        res.clearCookie('accessToken', {
            secure: true,
            sameSite: 'none'
        });
        return res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (e) {
        console.log('Hey something when wrong controller:logOutUser', e);
        return res.status(500).json({ message: 'Something went wrong while logging out. Please try again' });
    }
});
exports.logOutUser = logOutUser;
const checkLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    try {
        if (refreshToken) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    return res.status(401).json({ message: 'Unauthorized. Invalid or expired token' });
                }
                if (decoded) {
                    console.log('the decoded is', decoded);
                    const query = 'SELECT * FROM users WHERE id=$1';
                    const user = yield db_1.default.query(query, [decoded.id]);
                    if (user.rows.length > 0) {
                        const payload = {
                            id: decoded.id,
                            role: decoded.role
                        };
                        const accessToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_ACCESS_KEY, { expiresIn: '10min' });
                        res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'none' });
                        const userData = user.rows[0];
                        return res.status(200).json({
                            message: 'User found',
                            user: {
                                id: userData.id,
                                name: userData.name,
                                email: userData.email,
                                country: userData.country,
                                role: userData.role,
                                profileimage: userData.profileimage
                            }
                        });
                    }
                    else {
                        return res.status(401).json({ message: 'User not found with that id' });
                    }
                }
            }));
        }
        else {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    }
    catch (e) {
        console.log('Hey something when wrong controller:checkLogin', e);
        return res.status(500).json({ message: 'Something went wrong while checking login. Please try again' });
    }
});
exports.checkLogin = checkLogin;
const sendVerificationLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const user = yield db_1.default.query('SELECT * FROM users WHERE email=$1', [email]);
        if ((_b = user === null || user === void 0 ? void 0 : user.rows) === null || _b === void 0 ? void 0 : _b.length) {
            const token = (0, generateJWTKey_1.generateJWTKey)(user.rows[0].id);
            const message = `Please verify your account by clicking on the link below.
      ${clientUrl}/verifyaccount?token=${token}`;
            (0, sendEmail_1.sendEmail)(email, 'Welcome to MyBlog', message);
            return res.status(200).json({ message: 'Verification link sent successfully' });
        }
        else {
            return res.status(400).json({ message: 'User with that email not found' });
        }
    }
    catch (e) {
        console.log('hey error while sending verification link', e);
        return res.status(500).json({ message: 'Something went wrong while sending verification link. Please try again' });
    }
});
exports.sendVerificationLink = sendVerificationLink;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, token } = req.body;
    try {
        if (!token) {
            return res.status(400).json({ message: 'Token is invalid or not available' });
        }
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded) {
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashedPassword = bcrypt_1.default.hashSync(password, salt);
            const query = 'UPDATE users SET password=$1 WHERE id=$2';
            yield db_1.default.query(query, [hashedPassword, decoded.id]);
            return res.status(200).json({ message: 'Password changed successfully. You can login now' });
        }
        else {
            return res.status(400).json({ message: 'Invalid or expired token. Please try resending password reset link' });
        }
    }
    catch (e) {
        console.log('hey error while changing password', e);
        return res.status(500).json({ message: 'Something went wrong while changing password. Please try again' });
    }
});
exports.changePassword = changePassword;
//# sourceMappingURL=auth.js.map