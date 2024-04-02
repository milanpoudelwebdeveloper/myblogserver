"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../controllers/auth");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post('/signup', auth_1.signUp);
router.post('/login', auth_1.loginUser);
router.post('/verifyaccount', auth_1.verifyAccount);
router.get('/checklogin', auth_1.checkLogin);
router.get('/logout', auth_1.logOutUser);
router.post('/sendverification', auth_1.sendVerificationLink);
router.post('/changepassword', auth_1.changePassword);
exports.default = router;
//# sourceMappingURL=auth.js.map