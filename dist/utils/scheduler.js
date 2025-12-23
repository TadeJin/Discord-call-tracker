"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduler = void 0;
//Automatic statistic calling
const node_cron_1 = __importDefault(require("node-cron"));
const statisticsManager_1 = require("./statisticsManager");
const dataManager_1 = require("./dataManager");
const startScheduler = () => {
    try {
        node_cron_1.default.schedule("0 0 * * *", () => {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const dayOfMonth = now.getDate();
            if (dayOfWeek == 1 && dayOfMonth == 1) {
                (0, statisticsManager_1.showMonthStatistic)();
                (0, statisticsManager_1.clearWeeklyValues)();
                (0, statisticsManager_1.clearMonthValues)();
            }
            else if (dayOfWeek == 1) {
                (0, statisticsManager_1.showWeekStatistic)();
                (0, statisticsManager_1.addWeeklySum)();
                (0, statisticsManager_1.clearWeeklyValues)();
            }
            else if (dayOfMonth == 1) {
                (0, statisticsManager_1.showMonthStatistic)();
                (0, dataManager_1.addOverflows)();
                (0, statisticsManager_1.clearMonthValues)();
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
