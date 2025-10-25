"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNewUser = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const addNewUser = (userID) => {
    try {
        const filePath = path_1.default.join(__dirname, "..", "botConfig", "userTimes.json");
        const folderPath = path_1.default.join(__dirname, "..", "botConfig");
        if (!fs_1.default.existsSync(folderPath)) {
            fs_1.default.mkdirSync(folderPath, { recursive: true });
        }
        if (!fs_1.default.existsSync(filePath)) {
            fs_1.default.writeFileSync(filePath, JSON.stringify({}), "utf-8");
        }
        const fileContent = fs_1.default.readFileSync(filePath, "utf-8").trim();
        const userTimes = fileContent ? JSON.parse(fileContent) : {};
        userTimes[userID] = { time: "0" };
        fs_1.default.writeFileSync(filePath, JSON.stringify(userTimes), "utf-8");
    }
    catch (error) {
        console.log(error);
        return false;
    }
    return true;
};
exports.addNewUser = addNewUser;
