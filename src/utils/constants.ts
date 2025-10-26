import path from "path";

export const USER_TIMES_PATH = path.join(
    //Path to userTimes
    __dirname,
    "..",
    "botData",
    "userTimes.json"
);

export const MONTH_TIMES_PATH = path.join(
    //Path to monthlySum
    __dirname,
    "..",
    "botData",
    "monthlySum.json"
);

export const DATA_FOLDER_PATH = path.join(__dirname, "..", "botData"); //Path to folder containing data JSONs
