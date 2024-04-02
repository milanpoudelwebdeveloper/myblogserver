"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../controllers/user");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/', user_1.getAllUsers);
router.post('/', user_1.createUser);
router.put('/:id', user_1.updateUser);
exports.default = router;
//# sourceMappingURL=user.js.map