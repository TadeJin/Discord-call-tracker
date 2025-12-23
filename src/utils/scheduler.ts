//Automatic statistic calling
import cron from "node-cron";
import { USER_TIMES_PATH, MONTH_TIMES_PATH } from "./constants";
import {
    showWeekStatistic,
    addWeeklySum,
    showMonthStatistic,
    clearMonthValues,
    clearWeeklyValues,
} from "./statisticsManager";
import { addOverflows } from "./dataManager";

export const startScheduler = (): boolean => {
    try {
        cron.schedule("0 0 * * *", () => {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const dayOfMonth = now.getDate();

            if (dayOfWeek == 1 && dayOfMonth == 1) {
                showMonthStatistic();
                clearWeeklyValues()
                clearMonthValues()
            } else if (dayOfWeek == 1) {
                showWeekStatistic();
                addWeeklySum();
                clearWeeklyValues()
            } else if (dayOfMonth == 1) {
                showMonthStatistic();
                addOverflows();
                clearMonthValues()
            }
        });
    } catch (error) {
        console.error(error);
        return false;
    }
    return true;
};
