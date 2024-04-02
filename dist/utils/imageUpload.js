"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3 = exports.uploadMulter = void 0;
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const storage = multer_1.default.memoryStorage();
exports.uploadMulter = (0, multer_1.default)({ storage, limits: { fieldSize: 10 * 1024 * 1024 } });
const bucketRegion = process.env.BUCKET_REGION;
const awsAccessKey = process.env.AWS_ACCESS_KEY;
const AWS_SECRET = process.env.AWS_SECRET;
exports.s3 = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: AWS_SECRET
    },
    region: bucketRegion
});
//# sourceMappingURL=imageUpload.js.map