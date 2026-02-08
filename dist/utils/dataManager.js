"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAllJoinTimesIfInChannel = exports.updateJoinTimeIfInChannel = exports.addOverflows = exports.removeUserFromJSON = exports.addUserToTime = exports.addUserToMonth = exports.addUserTime = exports.addJoinTime = exports.createFileIfNotExists = exports.createFolderIfNotExists = exports.getJSONContent = void 0;
const fs_1 = __importDefault(require("fs"));
const constants_1 = require("./constants");
const statisticsManager_1 = require("./statisticsManager");
const discord_js_1 = require("discord.js");
const __1 = require("..");
require("dotenv/config");
const getJSONContent = (filePath) => {
    try {
        const fileContent = fs_1.default.readFileSync(filePath, "utf-8").trim();
        const jsonObj = fileContent ? JSON.parse(fileContent) : {};
        return jsonObj;
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
exports.getJSONContent = getJSONContent;
const createFolderIfNotExists = (folderPath) => {
    try {
        if (!fs_1.default.existsSync(folderPath)) {
            fs_1.default.mkdirSync(folderPath, { recursive: true });
        }
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
exports.createFolderIfNotExists = createFolderIfNotExists;
const createFileIfNotExists = (filePath) => {
    try {
        if (!fs_1.default.existsSync(filePath)) {
            fs_1.default.writeFileSync(filePath, JSON.stringify({}), "utf-8");
        }
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
exports.createFileIfNotExists = createFileIfNotExists;
//Tracking call time
const addJoinTime = (userID, time) => {
    try {
        const userTimes = (0, exports.getJSONContent)(constants_1.USER_TIMES_PATH);
        if (userTimes) {
            userTimes[userID] = {
                time: userTimes[userID].time,
                join_time: time,
                overflow: userTimes[userID].overflow,
                sessionCount: userTimes[userID].sessionCount
            };
            fs_1.default.writeFileSync(constants_1.USER_TIMES_PATH, JSON.stringify(userTimes), "utf-8");
            return true;
        }
        return false;
    }
    catch (error) {
        if (process.env.ADMIN_ID) {
            (0, statisticsManager_1.sendDebugMessage)(`Error adding join time to user! <@${process.env.ADMIN_ID}>`, "", true);
        }
        console.error(error);
        return false;
    }
};
exports.addJoinTime = addJoinTime;
const addUserTime = (userID, timeLeft) => {
    try {
        const userTimes = (0, exports.getJSONContent)(constants_1.USER_TIMES_PATH);
        if (userTimes[userID].join_time == "") {
            return false;
        }
        const joinTime = new Date(userTimes[userID].join_time).getTime();
        const leaveTime = timeLeft.getTime();
        userTimes[userID] = {
            time: (Number(userTimes[userID].time) +
                Math.floor((leaveTime - joinTime) / 1000)).toString(),
            join_time: "",
            overflow: userTimes[userID].overflow,
            sessionCount: (Number(userTimes[userID].sessionCount) + 1).toString()
        };
        fs_1.default.writeFileSync(constants_1.USER_TIMES_PATH, JSON.stringify(userTimes), "utf-8");
        return true;
    }
    catch (error) {
        if (process.env.ADMIN_ID) {
            (0, statisticsManager_1.sendDebugMessage)(`Error adding time to user! <@${process.env.ADMIN_ID}>`, "", true);
        }
        console.log(error);
        return false;
    }
};
exports.addUserTime = addUserTime;
const addUserToMonth = (userID) => {
    try {
        (0, exports.createFileIfNotExists)(constants_1.MONTH_TIMES_PATH);
        const monthTimes = (0, exports.getJSONContent)(constants_1.MONTH_TIMES_PATH);
        monthTimes[userID] = { time: "0", sessionCount: "0" };
        fs_1.default.writeFileSync(constants_1.MONTH_TIMES_PATH, JSON.stringify(monthTimes), "utf-8");
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
exports.addUserToMonth = addUserToMonth;
const addUserToTime = (userID) => {
    try {
        (0, exports.createFileIfNotExists)(constants_1.USER_TIMES_PATH);
        const userTimes = (0, exports.getJSONContent)(constants_1.USER_TIMES_PATH);
        userTimes[userID] = { time: "0", join_time: "", overflow: "0", sessionCount: "0" };
        fs_1.default.writeFileSync(constants_1.USER_TIMES_PATH, JSON.stringify(userTimes), "utf-8");
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
exports.addUserToTime = addUserToTime;
const removeUserFromJSON = (userID, filepath) => {
    try {
        const userTimes = (0, exports.getJSONContent)(filepath);
        if (!userTimes[userID])
            return false;
        delete userTimes[userID];
        fs_1.default.writeFileSync(filepath, JSON.stringify(userTimes), "utf-8");
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
exports.removeUserFromJSON = removeUserFromJSON;
const addOverflows = () => {
    try {
        const userTimes = (0, exports.getJSONContent)(constants_1.USER_TIMES_PATH);
        for (const userID in userTimes) {
            userTimes[userID] = { time: userTimes[userID].time, join_time: userTimes[userID].join_time, overflow: userTimes[userID].time, sessionCount: userTimes[userID].sessionCount };
        }
        fs_1.default.writeFileSync(constants_1.USER_TIMES_PATH, JSON.stringify(userTimes), "utf-8");
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
exports.addOverflows = addOverflows;
const getChannels = async () => {
    if (!process.env.SERVER_ID) {
        return new discord_js_1.Collection();
    }
    const guild = await __1.client.guilds.fetch(process.env.SERVER_ID);
    return guild.channels.fetch();
};
const updateJoinTimeIfInChannel = async (userID) => {
    if (!process.env.SERVER_ID) {
        return false;
    }
    try {
        const channels = await getChannels();
        for (const channel of channels.values()) {
            if (!channel || !channel.isVoiceBased()) {
                continue;
            }
            if (channel.members.has(userID)) {
                return (0, exports.addJoinTime)(userID, new Date());
            }
        }
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
exports.updateJoinTimeIfInChannel = updateJoinTimeIfInChannel;
const updateAllJoinTimesIfInChannel = async () => {
    if (!process.env.SERVER_ID) {
        return false;
    }
    try {
        const userTimes = (0, exports.getJSONContent)(constants_1.USER_TIMES_PATH);
        const channels = await getChannels();
        for (const channel of channels.values()) {
            if (!channel || !channel.isVoiceBased()) {
                continue;
            }
            for (const userID in userTimes) {
                if (channel.members.has(userID)) {
                    if (!(0, exports.addJoinTime)(userID, new Date())) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
exports.updateAllJoinTimesIfInChannel = updateAllJoinTimesIfInChannel;
