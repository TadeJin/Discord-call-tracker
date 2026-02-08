import fs from "fs";
import {
    MONTH_TIMES_PATH,
    USER_TIMES_PATH,
} from "./constants";
import { botData, monthlyTimeJSON, userTimeJSON } from "./types";
import { sendDebugMessage } from "./statisticsManager";
import { Collection, Guild, NonThreadGuildBasedChannel } from "discord.js";
import { client } from "..";
import "dotenv/config";

export const getJSONContent = (filePath: string): botData | {} | false => {
    try {
        const fileContent: string = fs.readFileSync(filePath, "utf-8").trim();
        const jsonObj = fileContent ? JSON.parse(fileContent) : {};
        return jsonObj;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const createFolderIfNotExists = (folderPath: string): boolean => {
    try {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const createFileIfNotExists = (filePath: string): boolean => {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify({}), "utf-8");
        }
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

//Tracking call time
export const addJoinTime = (userID: string, time: Date): boolean => {
    try {
        const userTimes = getJSONContent(USER_TIMES_PATH) as userTimeJSON;

        if (userTimes) {
            userTimes[userID] = {
                time: userTimes[userID].time,
                join_time: time,
                overflow: userTimes[userID].overflow,
                sessionCount: userTimes[userID].sessionCount
            };

            fs.writeFileSync(
                USER_TIMES_PATH,
                JSON.stringify(userTimes),
                "utf-8"
            );
            return true;
        }

        return false;
    } catch (error) {
        if (process.env.ADMIN_ID) {
            sendDebugMessage(`Error adding join time to user! <@${process.env.ADMIN_ID}>`, "", true)
        }
        console.error(error);
        return false;
    }
};

export const addUserTime = (userID: string, timeLeft: Date): boolean => {
    try {
        const userTimes = getJSONContent(USER_TIMES_PATH) as userTimeJSON;
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
            overflow: userTimes[userID].overflow,
            sessionCount: (Number(userTimes[userID].sessionCount) + 1).toString()
        };

        fs.writeFileSync(USER_TIMES_PATH, JSON.stringify(userTimes), "utf-8");

        return true;
    } catch (error) {
        if (process.env.ADMIN_ID) {
            sendDebugMessage(`Error adding time to user! <@${process.env.ADMIN_ID}>`, "", true)
        }
        console.log(error);
        return false;
    }
};

export const addUserToMonth = (userID: string): boolean => {
    try {
        createFileIfNotExists(MONTH_TIMES_PATH);

        const monthTimes = getJSONContent(MONTH_TIMES_PATH) as monthlyTimeJSON;

        monthTimes[userID] = { time: "0", sessionCount: "0" };

        fs.writeFileSync(MONTH_TIMES_PATH, JSON.stringify(monthTimes), "utf-8");
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const addUserToTime = (userID: string): boolean => {
    try {
        createFileIfNotExists(USER_TIMES_PATH);

        const userTimes = getJSONContent(USER_TIMES_PATH) as userTimeJSON;

        userTimes[userID] = { time: "0", join_time: "", overflow: "0", sessionCount: "0" };

        fs.writeFileSync(USER_TIMES_PATH, JSON.stringify(userTimes), "utf-8");
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const removeUserFromJSON = (userID: string, filepath: string): boolean => {
    try {
        const userTimes = getJSONContent(filepath) as botData;
        if (!userTimes[userID]) return false;
        delete userTimes[userID];

        fs.writeFileSync(filepath, JSON.stringify(userTimes), "utf-8");
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};


export const addOverflows = (): boolean => {
    try {

        const userTimes = getJSONContent(USER_TIMES_PATH) as userTimeJSON;
        
        for (const userID in userTimes) {
            userTimes[userID] = { time: userTimes[userID].time, join_time: userTimes[userID].join_time, overflow: userTimes[userID].time, sessionCount: userTimes[userID].sessionCount };
        }
        
        fs.writeFileSync(USER_TIMES_PATH, JSON.stringify(userTimes), "utf-8");
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

const getChannels = async (): Promise<Collection<string, NonThreadGuildBasedChannel | null>> => {
    if (!process.env.SERVER_ID) {
        return new Collection<string, null>();

    }

    const guild = await client.guilds.fetch(process.env.SERVER_ID)
    return guild.channels.fetch()
}

export const updateJoinTimeIfInChannel = async (userID: string): Promise<boolean> => {
    if (!process.env.SERVER_ID) {
        return false
    }

    try {
        const channels = await getChannels()

        for (const channel of channels.values()) {
            if (!channel || !channel.isVoiceBased()) {
                continue
            }

            if (channel.members.has(userID)) {
                return addJoinTime(userID, new Date())
            }
        }

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export const updateAllJoinTimesIfInChannel = async (): Promise<boolean> => {
    if (!process.env.SERVER_ID) {
        return false
    }

    try {
        const userTimes = getJSONContent(USER_TIMES_PATH) as userTimeJSON;
        const channels = await getChannels()

        for (const channel of channels.values()) {
            if (!channel || !channel.isVoiceBased()) {
                continue
            }

            for (const userID in userTimes) {
                if (channel.members.has(userID)) {
                    if (!addJoinTime(userID, new Date())) {
                        return false
                    }
                }
            }
        }

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}