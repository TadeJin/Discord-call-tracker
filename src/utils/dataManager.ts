import path from "path";
import fs from "fs";

const FILEPATH = path.join(__dirname, "..", "botConfig", "userTimes.json");

export const addJoinTime = (userID: string, time: Date) => {
    const userTimes = getUserTimeJSON();
    userTimes[userID] = {
        time: userTimes[userID].time,
        join_time: time,
    };

    fs.writeFileSync(FILEPATH, JSON.stringify(userTimes), "utf-8");
};

export const getUserTimeJSON = () => {
    try {
        const FILEPATH = path.join(
            __dirname,
            "..",
            "botConfig",
            "userTimes.json"
        );
        const fileContent = fs.readFileSync(FILEPATH, "utf-8").trim();
        return fileContent ? JSON.parse(fileContent) : {};
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const addNewUser = (userID: string) => {
    try {
        const folderPath = path.join(__dirname, "..", "botConfig");

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        if (!fs.existsSync(FILEPATH)) {
            fs.writeFileSync(FILEPATH, JSON.stringify({}), "utf-8");
        }

        const userTimes = getUserTimeJSON();

        userTimes[userID] = { time: "0", join_time: "" };

        fs.writeFileSync(FILEPATH, JSON.stringify(userTimes), "utf-8");
    } catch (error) {
        console.log(error);
        return false;
    }

    return true;
};

export const addUserTime = (userID: string, timeLeft: Date): boolean => {
    try {
        const userTimes = getUserTimeJSON();
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

        fs.writeFileSync(FILEPATH, JSON.stringify(userTimes), "utf-8");
    } catch (error) {
        console.log(error);
        return false;
    }

    return true;
};

export const removeUser = (userID: string) => {
    try {
        const userTimes = getUserTimeJSON();

        if (!userTimes[userID]) return false;
        delete userTimes[userID];

        fs.writeFileSync(FILEPATH, JSON.stringify(userTimes), "utf-8");
    } catch (error) {
        console.log(error);
        return false;
    }

    return true;
};
