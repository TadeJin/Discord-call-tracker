//Automatic statistic calling
import cron from "node-cron";
import { USER_TIMES_PATH, MONTH_TIMES_PATH } from "./constants";
import {
    showWeekStatistic,
    addWeeklySum,
    clearTimeValuesOfUsers,
    showMonthStatistic,
} from "./statisticsManager";

export const startScheduler = () => {
    //Every Monday midnight
    cron.schedule("0 0 * * 1", () => {
        showWeekStatistic();
        addWeeklySum();
        clearTimeValuesOfUsers(USER_TIMES_PATH);
    });

    //First of the month midnight
    cron.schedule("0 0 1 * *", () => {
        showMonthStatistic();
        clearTimeValuesOfUsers(USER_TIMES_PATH);
        clearTimeValuesOfUsers(MONTH_TIMES_PATH);
    });
};
