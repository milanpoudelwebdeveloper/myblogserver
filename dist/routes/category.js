"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const category_1 = require("../controllers/category");
const imageUpload_1 = require("../utils/imageUpload");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post('/', imageUpload_1.uploadMulter.single('image'), category_1.addCategory);
router.get('/', category_1.getCategories);
router.get('/:id', category_1.getCategoryDetails);
router.put('/:id', imageUpload_1.uploadMulter.single('image'), category_1.updateCategory);
router.delete('/:id', category_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=category.js.map