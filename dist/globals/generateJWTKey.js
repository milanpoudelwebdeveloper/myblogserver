"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJWTKey = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateJWTKey = (id, role) => {
    const payload = {
        id,
        role
    };
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
};
exports.generateJWTKey = generateJWTKey;
//# sourceMappingURL=generateJWTKey.js.map