//Automatic statistic calling
import cron from "node-cron";
import { USER_TIMES_PATH, MONTH_TIMES_PATH } from "./constants";
import {
    showWeekStatistic,
    addWeeklySum,
    clearTimeValuesOfUsers,
    showMonthStatistic,
} from "./statisticsManager";

export const startScheduler = (): boolean => {
    try {
        cron.schedule("0 0 * * *", () => {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const dayOfMonth = now.getDate();

            if (dayOfWeek == 1 && dayOfMonth == 1) {
                showMonthStatistic();
                clearTimeValuesOfUsers(USER_TIMES_PATH);
                clearTimeValuesOfUsers(MONTH_TIMES_PATH);
            } else if (dayOfWeek == 1) {
                showWeekStatistic();
                addWeeklySum();
                clearTimeValuesOfUsers(USER_TIMES_PATH);
            } else if (dayOfMonth == 1) {
                showMonthStatistic();
                clearTimeValuesOfUsers(MONTH_TIMES_PATH);
            }
        });
    } catch (error) {
        console.error(error);
        return false;
    }
    return true;
};
