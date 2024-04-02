"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blog_1 = require("../controllers/blog");
const imageUpload_1 = require("../utils/imageUpload");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/', blog_1.getBlogs);
router.get('/:id', blog_1.getBlogDetails);
router.post('/', imageUpload_1.uploadMulter.single('coverImage'), blog_1.addBlog);
router.put('/:id', imageUpload_1.uploadMulter.single('coverImage'), blog_1.updateBlog);
router.delete('/:id', blog_1.deleteBlog);
exports.default = router;
//# sourceMappingURL=blog.js.map