"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const category_1 = __importDefault(require("./routes/category"));
const blog_1 = __importDefault(require("./routes/blog"));
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const stats_1 = __importDefault(require("./routes/stats"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const allowedOrigins = ['http://localhost:3000', 'https://www.codewithmilan.com'];
app.use(express_1.default.json({ limit: '10mb' }));
app.use((0, cors_1.default)({
    credentials: true,
    // origin: (origin, callback) => {
    //   if (!origin) return callback(null, true)
    //   if (allowedOrigins.indexOf(origin) !== -1) {
    //     return callback(null, true)
    //   }
    //   return callback(new Error('Not allowed by CORS'))
    // },
    origin: allowedOrigins,
    methods: 'POST, GET, PUT, DELETE',
    optionsSuccessStatus: 204,
    allowedHeaders: 'Content-Type, Authorization'
}));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
app.set('trust proxy', 1);
app.use('/api/category', category_1.default);
app.use('/api/blog', blog_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/users', user_1.default);
app.use('/api/stats', stats_1.default);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map