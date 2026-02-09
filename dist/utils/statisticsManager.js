"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDebugMessage = exports.sendMessageToChannel = exports.addWeeklySum = exports.clearMonthValues = exports.clearWeeklyValues = exports.showMonthStatistic = exports.showWeekStatistic = void 0;
const __1 = require("..");
const dataManager_1 = require("./dataManager");
const fs_1 = __importDefault(require("fs"));
const constants_1 = require("./constants");
const showWeekStatistic = async (channel_ID) => {
    //Returns the weekly sum message
    try {
        if (!channel_ID) {
            throw new Error("Undefined channel ID!");
        }
        const userTime = (0, dataManager_1.getJSONContent)(constants_1.USER_TIMES_PATH);
        if (userTime) {
            let message = "Hello! The weekly sum of calls is here:\n";
            let total = 0;
            const users = [];
            for (const userID in userTime) {
                const actualTime = new Date().getTime();
                const currentTime = (userTime[userID].join_time != "") ? Math.floor((actualTime - new Date(userTime[userID].join_time).getTime()) / 1000) : 0;
                const usertimeSpent = Number(userTime[userID].time) + currentTime;
                const sessions = Number(userTime[userID].sessionCount) + (userTime[userID].join_time != "" ? 1 : 0);
                users.push([usertimeSpent, sessions, userID]);
            }
            users.sort((a, b) => b[0] - a[0]);
            let isFirst = true;
            for (const [time, sCount, id] of users) {
                if (isFirst && time > 0) {
                    message += "👑";
                }
                if (time > 0 && sCount > 0) {
                    message += `<@${id}> spent ${formatTimeData(time)} in call, during ${sCount.toString()} sessions, with average call time: ${formatTimeData(Math.floor(Number((time / sCount))))}\n`;
                    total += time;
                }
                isFirst = false;
            }
            if (total > 0) {
                message += `Total time spend in call this month is ${formatTimeData(total)}. Thanks for your attention :)`;
            }
            else {
                message += "No members were in a call this week. :(";
            }
            if (process.env.CHANNEL_ID) {
                return await (0, exports.sendMessageToChannel)(message, channel_ID);
            }
        }
        return false;
    }
    catch (error) {
        if (process.env.DEBUG_CHANNEL_ID && process.env.ADMIN_ID) {
            (0, exports.sendDebugMessage)(`Error sending weekly statistic! <@${process.env.ADMIN_ID}>`, "", true);
        }
        console.error(error);
        return false;
    }
};
exports.showWeekStatistic = showWeekStatistic;
const showMonthStatistic = async (channel_ID) => {
    //Returns the monthly sum message
    try {
        if (!channel_ID) {
            throw new Error("Undefined channel ID!");
        }
        const monthlyTime = (0, dataManager_1.getJSONContent)(constants_1.MONTH_TIMES_PATH);
        const userTime = (0, dataManager_1.getJSONContent)(constants_1.USER_TIMES_PATH);
        const users = [];
        if (monthlyTime && userTime) {
            let message = "Hello! The monthly sum of calls is here:\n";
            let total = 0;
            for (const userID in monthlyTime) {
                const actualTime = new Date().getTime();
                const currentTime = (userTime[userID].join_time != "") ? Math.floor((actualTime - new Date(userTime[userID].join_time).getTime()) / 1000) : 0;
                const usertimeSpent = Number(monthlyTime[userID].time) +
                    Number(userTime[userID].time) +
                    currentTime;
                const sessions = Number(userTime[userID].sessionCount) + Number(monthlyTime[userID].sessionCount) + (userTime[userID].join_time != "" ? 1 : 0);
                users.push([usertimeSpent, sessions, userID]);
            }
            users.sort((a, b) => b[0] - a[0]);
            let isFirst = true;
            for (const [usertimeSpent, sessions, userID] of users) {
                if (isFirst && usertimeSpent > 0) {
                    message += "👑";
                }
                if (usertimeSpent > 0 && sessions > 0) {
                    message += `<@${userID}> spent ${formatTimeData(usertimeSpent)} in call, during ${sessions.toString()} sessions, with average call time: ${formatTimeData(Number(Math.floor((usertimeSpent / Number(sessions)))))}\n`;
                    total += usertimeSpent;
                }
                isFirst = false;
            }
            if (total > 0) {
                message += `Total time spend in call this month is ${formatTimeData(total)}. Thanks for your attention :)`;
            }
            else {
                message += "No members were in a call this month. :(";
            }
            if (process.env.CHANNEL_ID) {
                return await (0, exports.sendMessageToChannel)(message, channel_ID);
            }
        }
        return false;
    }
    catch (error) {
        if (process.env.ADMIN_ID) {
            (0, exports.sendDebugMessage)(`Error sending monthly statistic! <@${process.env.ADMIN_ID}>`, "", true);
        }
        console.error(error);
        return false;
    }
};
exports.showMonthStatistic = showMonthStatistic;
const clearWeeklyValues = () => {
    //Clears the weekly time of all users to 0
    try {
        const timeJSON = (0, dataManager_1.getJSONContent)(constants_1.USER_TIMES_PATH);
        for (const userID in timeJSON) {
            timeJSON[userID] = { time: "0", join_time: "", overflow: "0", sessionCount: "0" };
        }
        fs_1.default.writeFileSync(constants_1.USER_TIMES_PATH, JSON.stringify(timeJSON), "utf-8");
        return true;
    }
    catch (error) {
        if (process.env.ADMIN_ID) {
            (0, exports.sendDebugMessage)(`Error clearing weekly values! <@${process.env.ADMIN_ID}>`, "", true);
        }
        console.error(error);
        return false;
    }
};
exports.clearWeeklyValues = clearWeeklyValues;
const clearMonthValues = () => {
    //Clears the monthly time of all users to 0
    try {
        const timeJSON = (0, dataManager_1.getJSONContent)(constants_1.MONTH_TIMES_PATH);
        for (const userID in timeJSON) {
            timeJSON[userID] = { time: "0", sessionCount: "0" };
        }
        fs_1.default.writeFileSync(constants_1.MONTH_TIMES_PATH, JSON.stringify(timeJSON), "utf-8");
        return true;
    }
    catch (error) {
        if (process.env.ADMIN_ID) {
            (0, exports.sendDebugMessage)(`Error clearing monthly values! <@${process.env.ADMIN_ID}>`, "", true);
        }
        console.error(error);
        return false;
    }
};
exports.clearMonthValues = clearMonthValues;
const addWeeklySum = () => {
    //Adds weekly sum to monthly sum
    try {
        const userTime = (0, dataManager_1.getJSONContent)(constants_1.USER_TIMES_PATH);
        const monthlyTime = (0, dataManager_1.getJSONContent)(constants_1.MONTH_TIMES_PATH);
        for (const userID in userTime) {
            monthlyTime[userID] = {
                time: (Number(monthlyTime[userID].time) +
                    Number(userTime[userID].time) - Number(userTime[userID].overflow)).toString(),
                sessionCount: (Number(monthlyTime[userID].sessionCount) + Number(userTime[userID].sessionCount)).toString()
            };
        }
        fs_1.default.writeFileSync(constants_1.MONTH_TIMES_PATH, JSON.stringify(monthlyTime), "utf-8");
        return true;
    }
    catch (error) {
        if (process.env.ADMIN_ID) {
            (0, exports.sendDebugMessage)(`Error adding weekly sum! <@${process.env.ADMIN_ID}>`, "", true);
        }
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
            if (successMessage != "") {
                (0, exports.sendMessageToChannel)(successMessage, process.env.DEBUG_CHANNEL_ID);
            }
        }
        else {
            if (errorMessage != "") {
                (0, exports.sendMessageToChannel)(errorMessage, process.env.DEBUG_CHANNEL_ID);
            }
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
    if (hours === 0 && minutes === 0 && seconds === 0) {
        return "NO_DATA";
    }
    const parts = [];
    if (hours > 0)
        parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
    if (minutes > 0)
        parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
    if (seconds > 0)
        parts.push(`${seconds} ${seconds === 1 ? "second" : "seconds"}`);
    return parts.join(" ");
};
