import fs from "fs";
import {
    CONFIG_FOLDER_PATH,
    MONTH_TIMES_PATH,
    USER_TIMES_PATH,
} from "./constants";

export const getJSONContent = (filePath: string) => {
    try {
        const fileContent = fs.readFileSync(filePath, "utf-8").trim();
        return fileContent ? JSON.parse(fileContent) : {};
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const createFolderIfNotExists = (folderPath: string) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

export const createFileIfNotExists = (filePath: string) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}), "utf-8");
    }
};

//Tracking call time
export const addJoinTime = (userID: string, time: Date) => {
    const userTimes = getJSONContent(USER_TIMES_PATH);
    userTimes[userID] = {
        time: userTimes[userID].time,
        join_time: time,
    };

    fs.writeFileSync(USER_TIMES_PATH, JSON.stringify(userTimes), "utf-8");
};

export const addUserTime = (userID: string, timeLeft: Date): boolean => {
    try {
        const userTimes = getJSONContent(USER_TIMES_PATH);
        if (userTimes[userID].join_time == "") {
            return false;
        }

        const joinTime = new Date(userTimes[userID].join_time).getTime();
        const leaveTime = timeLeft.getTime();

        userTimes[userID] = {
            time: (
                Number(userTimes[userID].time) +
                Math.floor((leaveTime - joinTime) / 1000)
            ).toString(),
            join_time: "",
        };

        fs.writeFileSync(USER_TIMES_PATH, JSON.stringify(userTimes), "utf-8");
    } catch (error) {
        console.log(error);
        return false;
    }

    return true;
};

//NEW USER
export const addNewUser = (userID: string) => {
    try {
        createFolderIfNotExists(CONFIG_FOLDER_PATH);
        addUserToTime(userID);
        addUserToMonth(userID);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const addUserToMonth = (userID: string) => {
    try {
        createFileIfNotExists(MONTH_TIMES_PATH);

        const monthTimes = getJSONContent(MONTH_TIMES_PATH);

        monthTimes[userID] = { time: "0" };

        fs.writeFileSync(MONTH_TIMES_PATH, JSON.stringify(monthTimes), "utf-8");
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

const addUserToTime = (userID: string) => {
    try {
        createFileIfNotExists(USER_TIMES_PATH);

        const userTimes = getJSONContent(USER_TIMES_PATH);

        userTimes[userID] = { time: "0", join_time: "" };

        fs.writeFileSync(USER_TIMES_PATH, JSON.stringify(userTimes), "utf-8");
    } catch (error) {
        console.error(error);
        return false;
    }
};

//REMOVING USER
export const removeUser = (userID: string) => {
    try {
        removeUserFromJSON(userID, USER_TIMES_PATH);
        removeUserFromJSON(userID, MONTH_TIMES_PATH);
    } catch (error) {
        console.log(error);
        return false;
    }

    return true;
};

const removeUserFromJSON = (userID: string, filepath: string) => {
    const userTimes = getJSONContent(filepath);

    if (!userTimes[userID]) return false;
    delete userTimes[userID];

    fs.writeFileSync(filepath, JSON.stringify(userTimes), "utf-8");
};
