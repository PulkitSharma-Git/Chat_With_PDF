"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const bullmq_1 = require("bullmq");
const queue = new bullmq_1.Queue("file-upload-queue", {
    connection: {
        host: "localhost",
        port: 6379
    },
});
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.get("/", (req, res) => {
    res.json({ status: "All Good" });
});
app.post("/upload/pdf", upload.single('pdf'), (req, res) => {
    var _a, _b, _c;
    queue.add('file-ready', JSON.stringify({
        filename: (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname,
        destination: (_b = req.file) === null || _b === void 0 ? void 0 : _b.destination,
        path: (_c = req.file) === null || _c === void 0 ? void 0 : _c.path,
    }));
    res.json({ message: "uploaded" });
});
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server started at PORT ${PORT}`);
});
