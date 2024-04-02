"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stats_1 = require("../controllers/stats");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/', stats_1.getStats);
exports.default = router;
//# sourceMappingURL=stats.js.map