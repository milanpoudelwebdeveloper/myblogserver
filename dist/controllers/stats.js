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
exports.getStats = void 0;
const db_1 = __importDefault(require("../db"));
const getStats = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = 'SELECT COUNT(*) as totalBlogs FROM blog';
        const blogCount = yield db_1.default.query(query, []);
        const query2 = 'SELECT COUNT(*) as totalCategories FROM category';
        const categoryCount = yield db_1.default.query(query2, []);
        const query3 = 'SELECT COUNT(*) as totalUsers FROM users';
        const userCount = yield db_1.default.query(query3, []);
        const stats = {
            totalBlogs: blogCount.rows[0].totalblogs,
            totalCategories: categoryCount.rows[0].totalcategories,
            totalUsers: userCount.rows[0].totalusers
        };
        res.status(200).json({ message: 'Feteched successfully', data: stats });
    }
    catch (e) {
        console.log('Error while fetching controller stats:', e);
        res.status(500).json({ message: 'Something went wrong while fetching stats. Please try again' });
    }
});
exports.getStats = getStats;
//# sourceMappingURL=stats.js.map