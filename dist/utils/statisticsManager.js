"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDebugMessage = exports.sendMessageToChannel = exports.addWeeklySum = exports.clearTimeValuesOfUsers = exports.showMonthStatistic = exports.showWeekStatistic = void 0;
const __1 = require("..");
const dataManager_1 = require("./dataManager");
const fs_1 = __importDefault(require("fs"));
const constants_1 = require("./constants");
const showWeekStatistic = async () => {
    //Returns the weekly sum message
    try {
        const userTime = (0, dataManager_1.getJSONContent)(constants_1.USER_TIMES_PATH);
        if (userTime) {
            let message = "Hello! The weekly sum of calls is here:\n";
            let total = 0;
            for (const userID in userTime) {
                const usertimeSpent = Number(userTime[userID].time);
                message += `<@${userID}> spent${formatTimeData(usertimeSpent)} in call\n`;
                total += usertimeSpent;
            }
            message += `Total time spend in call this week is ${formatTimeData(total)}. Thanks for your attention :)`;
            if (process.env.CHANNEL_ID) {
                return await (0, exports.sendMessageToChannel)(message, process.env.CHANNEL_ID);
            }
        }
        return false;
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
exports.showWeekStatistic = showWeekStatistic;
const showMonthStatistic = async () => {
    //Returns the monthly sum message
    try {
        const monthlyTime = (0, dataManager_1.getJSONContent)(constants_1.MONTH_TIMES_PATH);
        const userTime = (0, dataManager_1.getJSONContent)(constants_1.USER_TIMES_PATH);
        if (monthlyTime && userTime) {
            let message = "Hello! The monthly sum of calls is here:\n";
            let total = 0;
            for (const userID in monthlyTime) {
                const usertimeSpent = Number(monthlyTime[userID].time) +
                    Number(userTime[userID].time);
                message += `<@${userID}>spent ${formatTimeData(usertimeSpent)} in call\n`;
                total += usertimeSpent;
            }
            message += `Total time spend in call this month is ${formatTimeData(total)}. Thanks for your attention :)`;
            if (process.env.CHANNEL_ID) {
                return await (0, exports.sendMessageToChannel)(message, process.env.CHANNEL_ID);
            }
        }
        return false;
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
exports.showMonthStatistic = showMonthStatistic;
const clearTimeValuesOfUsers = (filePath) => {
    //Clears the time of all users to 0
    try {
        const timeJSON = (0, dataManager_1.getJSONContent)(filePath);
        for (const userID in timeJSON) {
            timeJSON[userID] = { time: "0" };
        }
        fs_1.default.writeFileSync(filePath, JSON.stringify(timeJSON), "utf-8");
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
exports.clearTimeValuesOfUsers = clearTimeValuesOfUsers;
const addWeeklySum = () => {
    //Adds weekly sum to monthly sum
    try {
        const userTime = (0, dataManager_1.getJSONContent)(constants_1.USER_TIMES_PATH);
        const monthlyTime = (0, dataManager_1.getJSONContent)(constants_1.MONTH_TIMES_PATH);
        for (const userID in userTime) {
            monthlyTime[userID] = {
                time: (Number(monthlyTime[userID].time) +
                    Number(userTime[userID].time)).toString(),
            };
        }
        fs_1.default.writeFileSync(constants_1.MONTH_TIMES_PATH, JSON.stringify(monthlyTime), "utf-8");
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
exports.addWeeklySum = addWeeklySum;
const sendMessageToChannel = async (
//Sends message to specified channel
message, channelID) => {
    const channel = (await __1.client.channels.fetch(channelID));
    if (channel) {
        channel.send(message);
        return true;
    }
    return false;
};
exports.sendMessageToChannel = sendMessageToChannel;
const sendDebugMessage = (successMessage, errorMessage, condition) => {
    if (process.env.DEBUG_CHANNEL_ID) {
        if (condition) {
            (0, exports.sendMessageToChannel)(successMessage, process.env.DEBUG_CHANNEL_ID);
        }
        else {
            (0, exports.sendMessageToChannel)(errorMessage, process.env.DEBUG_CHANNEL_ID);
        }
    }
};
exports.sendDebugMessage = sendDebugMessage;
const formatTimeData = (data) => {
    //Formats time data to hours minutes and seconds
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    if (data >= 3600) {
        hours = Math.floor(data / 3600);
        data -= hours * 3600;
    }
    if (data >= 60) {
        minutes = Math.floor(data / 60);
        data -= minutes * 60;
    }
    if (data != 0) {
        seconds = data;
    }
    if (hours == 0 && minutes == 0 && seconds == 0) {
        return " NO_DATA";
    }
    else {
        return `${hours > 0 ? hours + " hours " : ""} ${minutes > 0 ? minutes + " minutes " : ""}${seconds > 0 ? seconds + " seconds" : ""}`;
    }
};
