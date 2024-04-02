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
exports.updateUser = exports.createUser = exports.getAllUsers = void 0;
const db_1 = __importDefault(require("../db"));
const generateJWTKey_1 = require("../globals/generateJWTKey");
const sendEmail_1 = require("../globals/sendEmail");
const clientUrl = process.env.CLIENT_URL;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const query = 'SELECT id, name, email, role, profileimage, verified FROM users';
        const users = yield db_1.default.query(query, []);
        if ((_a = users === null || users === void 0 ? void 0 : users.rows) === null || _a === void 0 ? void 0 : _a.length) {
            return res.status(200).json({ users: users.rows });
        }
        else {
            return res.status(404).json({ message: 'No users found' });
        }
    }
    catch (e) {
        console.log('Something went wrong: Controller: getAllUsers', e);
        return res.status(500).json({ message: 'Something went wrong while gettng users list' });
    }
});
exports.getAllUsers = getAllUsers;
var roles;
(function (roles) {
    roles["admin"] = "admin";
    roles["writer"] = "writer";
})(roles || (roles = {}));
const roleOptions = [roles.admin, roles.writer];
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, role } = req.body;
        if (!email || !role) {
            return res.status(400).json({ message: 'Both email and role are required' });
        }
        if ((roleOptions === null || roleOptions === void 0 ? void 0 : roleOptions.indexOf(role)) === -1) {
            return res.status(400).json({ message: 'Invalid role provided' });
        }
        const user = yield db_1.default.query('SELECT * FROM users WHERE email=$1', [email]);
        if (user === null || user === void 0 ? void 0 : user.rowCount) {
            return res.status(400).json({ message: 'User with that email already exists' });
        }
        const randomPassword = Math.random().toString(36).slice(-8);
        const query = 'INSERT INTO users(email, role, password) VALUES($1, $2, $3) RETURNING id';
        const userCreated = yield db_1.default.query(query, [email, role, randomPassword]);
        if (userCreated === null || userCreated === void 0 ? void 0 : userCreated.rowCount) {
            const token = (0, generateJWTKey_1.generateJWTKey)(userCreated.rows[0].id, role);
            const message = `You are invited to the platform "Code With Milan" to contribute as an ${role}. Please verify your account by clicking on the link below and please set your password.
      ${clientUrl}/verifyaccount?token=${token}`;
            (0, sendEmail_1.sendEmail)(email, 'Welcome to MyBlog', message);
            return res.status(201).json({ message: 'User created successfully' });
        }
        else {
            return res.status(500).json({ message: 'Something went wrong while creating user' });
        }
    }
    catch (e) {
        console.log('Something went wrong: Controller: createUser', e);
        return res.status(500).json({ message: 'Something went wrong while creating user' });
    }
});
exports.createUser = createUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, country } = req.body;
    const { id } = req.params;
    try {
        if (!name || !country || !id) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const foundUser = yield db_1.default.query('SELECT * FROM users WHERE id=$1', [id]);
        if (!(foundUser === null || foundUser === void 0 ? void 0 : foundUser.rowCount) || !foundUser) {
            return res.status(404).json({ message: 'User with that id not found' });
        }
        const query = 'UPDATE users SET name=$1, country=$2 WHERE id=$3';
        yield db_1.default.query(query, [name, country, id]);
        return res.status(200).json({ message: 'User updated successfully' });
    }
    catch (e) {
        console.log('Something went wrong: Controller: updateUser', e);
        return res.status(500).json({ message: 'Something went wrong while updating user' });
    }
});
exports.updateUser = updateUser;
//# sourceMappingURL=user.js.map