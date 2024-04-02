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
exports.deleteBlog = exports.updateBlog = exports.getBlogDetails = exports.getBlogs = exports.addBlog = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const db_1 = __importDefault(require("../db"));
const imageUpload_1 = require("../utils/imageUpload");
const bucketName = process.env.BUCKET_NAME;
const addBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { title, content, category, published } = req.body;
        const coverImage = req.file;
        if (!title || !content || !coverImage || !category) {
            return res.status(400).json({ message: 'Please fill all the fields' });
        }
        const uploadParams = {
            Bucket: bucketName,
            Key: ((_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.originalname) + '-' + Date.now(),
            Body: (_b = req === null || req === void 0 ? void 0 : req.file) === null || _b === void 0 ? void 0 : _b.buffer,
            ContentType: (_c = req === null || req === void 0 ? void 0 : req.file) === null || _c === void 0 ? void 0 : _c.mimetype
        };
        yield imageUpload_1.s3.send(new client_s3_1.PutObjectCommand(uploadParams));
        const query = 'INSERT INTO blog (title, content, coverImage, category, published) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const blog = yield db_1.default.query(query, [title, content, uploadParams.Key, category, published]);
        if (blog.rows.length > 0) {
            const message = published ? 'Blog published successfully' : 'Blog saved as draft successfully';
            return res.status(201).json({ message: message, blog: blog.rows[0] });
        }
        else {
            return res.status(500).json({ message: 'Something went wrong while performing an action.Please try again' });
        }
    }
    catch (e) {
        console.log('hey error while adding blog', e);
        return res.status(500).json({ message: 'Something went wrong while performing an action.Please try again' });
    }
});
exports.addBlog = addBlog;
const getBlogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId } = req.query;
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let blogs = [];
        if (categoryId === 'all') {
            blogs = yield db_1.default.query('SELECT blog.*, category.name AS categoryname FROM blog JOIN category ON blog.category=category.id ORDER BY blog.id DESC', []);
        }
        else {
            blogs = yield db_1.default.query('SELECT blog.*, category.name AS categoryname FROM blog JOIN category ON blog.category=category.id WHERE category=$1 ORDER BY blog.id DESC', [categoryId]);
        }
        if (blogs.rows.length > 0) {
            for (const blog of blogs.rows) {
                const getObjectParams = {
                    Bucket: bucketName,
                    Key: blog.coverimage
                };
                const command = new client_s3_1.GetObjectCommand(getObjectParams);
                const url = yield (0, s3_request_presigner_1.getSignedUrl)(imageUpload_1.s3, command);
                blog.coverimage = url;
            }
            return res.status(200).json({
                message: 'Blogs fetched successfully',
                data: blogs.rows
            });
        }
        else {
            return res.status(404).json({ message: 'No blogs found' });
        }
    }
    catch (e) {
        console.log('hey error while getting blogs', e);
        return res.status(500).json({ message: 'Something went wrong while getting blogs. Please try again' });
    }
});
exports.getBlogs = getBlogs;
const getBlogDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const { id } = req.params;
    try {
        const blogDetails = yield db_1.default.query('SELECT * FROM blog WHERE id=$1', [id]);
        if ((_d = blogDetails === null || blogDetails === void 0 ? void 0 : blogDetails.rows) === null || _d === void 0 ? void 0 : _d.length) {
            const foundBlog = blogDetails === null || blogDetails === void 0 ? void 0 : blogDetails.rows[0];
            const getObjectParams = {
                Bucket: bucketName,
                Key: foundBlog.coverimage
            };
            const command = new client_s3_1.GetObjectCommand(getObjectParams);
            const url = yield (0, s3_request_presigner_1.getSignedUrl)(imageUpload_1.s3, command);
            foundBlog.coverimage = url;
            return res.status(201).json({
                message: 'Blog Details fetched successfully',
                data: foundBlog
            });
        }
        else {
            return res.status(404).json({ message: 'No blog details found' });
        }
    }
    catch (e) {
        console.log('hey error while getting blog details', e);
        return res.status(500).json({ message: 'Something went wrong while getting blog details. Please try again' });
    }
});
exports.getBlogDetails = getBlogDetails;
const updateBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content, category, published } = req.body;
    const { id } = req.params;
    console.log('the title here in', title);
    try {
        const findBlog = yield db_1.default.query('SELECT DISTINCT * FROM blog WHERE id=$1', [id]);
        if (findBlog.rows.length > 0) {
            const foundBlog = findBlog.rows[0];
            console.log('the found blog', foundBlog);
            const query = 'UPDATE blog SET title=$1, content=$2, coverImage=$3, category=$4, published=$5 WHERE id=$6 RETURNING *';
            yield db_1.default.query(query, [title, content, foundBlog.coverimage, category, published, id]);
            return res.status(201).json({ message: 'Blog updated successfully' });
        }
        else {
            return res.status(404).json({ message: 'No blog found' });
        }
    }
    catch (e) {
        console.log('hey error while saving as draft', e);
        return res.status(500).json({ message: 'Something went wrong while saving as draft. Please try again' });
    }
});
exports.updateBlog = updateBlog;
const deleteBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const findBlog = yield db_1.default.query('SELECT DISTINCT * FROM blog WHERE id=$1', [id]);
        if (findBlog.rows.length > 0) {
            const foundBlog = findBlog.rows[0];
            const query = 'DELETE FROM blog WHERE id=$1';
            yield db_1.default.query(query, [id]);
            const deleteParams = {
                Bucket: bucketName,
                Key: foundBlog.coverimage
            };
            yield imageUpload_1.s3.send(new client_s3_1.DeleteObjectCommand(deleteParams));
            return res.status(201).json({ message: 'Blog deleted successfully' });
        }
        else {
            return res.status(404).json({ message: 'No blog found' });
        }
    }
    catch (e) {
        console.log('hey error while deleting blog', e);
        return res.status(500).json({ message: 'Something went wrong while deleting blog. Please try again' });
    }
});
exports.deleteBlog = deleteBlog;
//# sourceMappingURL=blog.js.map