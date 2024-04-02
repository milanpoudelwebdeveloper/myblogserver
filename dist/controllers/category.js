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
exports.deleteCategory = exports.updateCategory = exports.addCategory = exports.getCategoryDetails = exports.getCategories = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const db_1 = __importDefault(require("../db"));
const imageUpload_1 = require("../utils/imageUpload");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const bucketName = process.env.BUCKET_NAME;
const getCategories = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield db_1.default.query('SELECT * FROM category', []);
        if (categories.rows.length > 0) {
            for (const category of categories.rows) {
                const getObjectParams = {
                    Bucket: bucketName,
                    Key: category.image
                };
                const command = new client_s3_1.GetObjectCommand(getObjectParams);
                const url = yield (0, s3_request_presigner_1.getSignedUrl)(imageUpload_1.s3, command);
                category.image = url;
            }
            return res.status(200).json({
                message: 'Categories fetched successfully',
                data: categories.rows
            });
        }
        else {
            return res.status(404).json({ message: 'No categories found' });
        }
    }
    catch (e) {
        console.log('hey error while getting categories', e);
        return res.status(500).json({ message: 'Something went wrong while getting categories.Please try again' });
    }
});
exports.getCategories = getCategories;
const getCategoryDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const category = yield db_1.default.query('SELECT * FROM category WHERE id=$1', [id]);
        if (category.rows.length > 0) {
            const getObjectParams = {
                Bucket: bucketName,
                Key: category.rows[0].image
            };
            const command = new client_s3_1.GetObjectCommand(getObjectParams);
            const url = yield (0, s3_request_presigner_1.getSignedUrl)(imageUpload_1.s3, command);
            category.rows[0].image = url;
            return res.status(200).json({ message: 'Category fetched successfully', data: category.rows[0] });
        }
        else {
            return res.status(404).json({ message: 'Category not found' });
        }
    }
    catch (e) {
        console.log('hey error while getting category details', e);
        return res.status(500).json({ message: 'Something went wrong while getting category details.Please try again' });
    }
});
exports.getCategoryDetails = getCategoryDetails;
const addCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { name } = req.body;
    if (!name || !req.file) {
        return res.status(400).json({ message: 'Name and image are required' });
    }
    try {
        const categoryExists = yield db_1.default.query('SELECT * FROM category WHERE name=$1', [name]);
        if (categoryExists.rows.length > 0) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        const uploadParams = {
            Bucket: bucketName,
            Key: ((_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.originalname) + '-' + Date.now(),
            Body: (_b = req === null || req === void 0 ? void 0 : req.file) === null || _b === void 0 ? void 0 : _b.buffer,
            ContentType: (_c = req === null || req === void 0 ? void 0 : req.file) === null || _c === void 0 ? void 0 : _c.mimetype
        };
        yield imageUpload_1.s3.send(new client_s3_1.PutObjectCommand(uploadParams));
        const category = yield db_1.default.query('INSERT INTO category (name, image) VALUES($1, $2) RETURNING *', [name, uploadParams.Key]);
        if (category.rows.length > 0) {
            return res.status(201).json({ message: 'Category added successfully', category: category.rows[0] });
        }
        else {
            return res.status(500).json({ message: 'Something went wrong while creating a new category.Please try again' });
        }
    }
    catch (error) {
        console.log('hey error while adding category', error);
        return res.status(500).json({ message: 'Something went wrong while adding category. Please try again' });
    }
});
exports.addCategory = addCategory;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name } = req.body;
        let finalFile;
        const image = req.file;
        if (image) {
            const uploadParams = {
                Bucket: bucketName,
                Key: (image === null || image === void 0 ? void 0 : image.originalname) + '-' + Date.now(),
                Body: image === null || image === void 0 ? void 0 : image.buffer,
                ContentType: image === null || image === void 0 ? void 0 : image.mimetype
            };
            yield imageUpload_1.s3.send(new client_s3_1.PutObjectCommand(uploadParams));
            finalFile = uploadParams.Key;
        }
        if (!name) {
            return res.status(400).json({ message: 'Name and image are required' });
        }
        else {
            const category = yield db_1.default.query('UPDATE category SET name=$1, image = COALESCE($2, image) WHERE id=$3 RETURNING *', [
                name,
                finalFile,
                id
            ]);
            if (category.rows.length > 0) {
                return res.status(200).json({ message: 'Category updated successfully', category: category.rows[0] });
            }
            else {
                return res.status(404).json({ message: 'Category not found' });
            }
        }
    }
    catch (e) {
        console.log('hey error while updating category', e);
        return res.status(500).json({ message: 'Something went wrong while updating category.Please try again' });
    }
});
exports.updateCategory = updateCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield db_1.default.query('DELETE FROM category WHERE id=$1 RETURNING *', [id]);
        return res.status(200).json({ message: 'Category deleted successfully' });
    }
    catch (e) {
        console.log('hey error while deleting category', e);
        return res.status(500).json({ message: 'Something went wrong while deleting category. Please try again' });
    }
});
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=category.js.map