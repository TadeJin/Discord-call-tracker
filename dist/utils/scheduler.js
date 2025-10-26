"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduler = void 0;
//Automatic statistic calling
const node_cron_1 = __importDefault(require("node-cron"));
const constants_1 = require("./constants");
const statisticsManager_1 = require("./statisticsManager");
const startScheduler = () => {
    try {
        node_cron_1.default.schedule("0 0 * * *", () => {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const dayOfMonth = now.getDate();
            if (dayOfWeek == 1 && dayOfMonth == 1) {
                (0, statisticsManager_1.showMonthStatistic)();
                (0, statisticsManager_1.clearTimeValuesOfUsers)(constants_1.USER_TIMES_PATH);
                (0, statisticsManager_1.clearTimeValuesOfUsers)(constants_1.MONTH_TIMES_PATH);
            }
            else if (dayOfWeek == 1) {
                (0, statisticsManager_1.showWeekStatistic)();
                (0, statisticsManager_1.addWeeklySum)();
                (0, statisticsManager_1.clearTimeValuesOfUsers)(constants_1.USER_TIMES_PATH);
            }
            else if (dayOfMonth == 1) {
                (0, statisticsManager_1.showMonthStatistic)();
                (0, statisticsManager_1.clearTimeValuesOfUsers)(constants_1.USER_TIMES_PATH);
                (0, statisticsManager_1.clearTimeValuesOfUsers)(constants_1.MONTH_TIMES_PATH);
            }
        });
    }
    catch (error) {
        console.error(error);
        return false;
    }
    return true;
};
exports.startScheduler = startScheduler;
