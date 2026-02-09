import { TextChannel } from "discord.js";
import { client } from "..";
import { getJSONContent } from "./dataManager";
import fs from "fs";
import { MONTH_TIMES_PATH, USER_TIMES_PATH } from "./constants";
import { botData, monthlyTimeJSON, userTimeJSON } from "./types";

export const showWeekStatistic = async (channel_ID: string | undefined): Promise<boolean> => {
    //Returns the weekly sum message
    try {
        if (!channel_ID) {
            throw new Error("Undefined channel ID!");
        }

        const userTime = getJSONContent(USER_TIMES_PATH) as userTimeJSON;
        if (userTime) {
            let message = "Hello! The weekly sum of calls is here:\n";
            let total = 0;

            for (const userID in userTime) {
                const actualTime = new Date().getTime()
                const currentTime = (userTime[userID].join_time != "") ? Math.floor((actualTime - new Date(userTime[userID].join_time).getTime()) / 1000) : 0

                const usertimeSpent = Number(userTime[userID].time) + currentTime;
                const sessions = Number(userTime[userID].sessionCount) + (userTime[userID].join_time != "" ? 1 : 0)
                if (usertimeSpent > 0 && sessions > 0) {
                    message += `<@${userID}> spent ${formatTimeData(usertimeSpent)} in call, during ${sessions.toString()} sessions, with average call time: ${formatTimeData(Math.floor(Number((usertimeSpent / sessions))))}\n`;
                    total += usertimeSpent;
                }
            }

            if (total > 0) {
                message += `Total time spend in call this month is ${formatTimeData(
                    total
                )}. Thanks for your attention :)`;
            } else {
                message += "No members were in a call this week. :("
            }

            if (process.env.CHANNEL_ID) {
                return await sendMessageToChannel(
                    message,
                    channel_ID
                );
            }
        }

        return false;
    } catch (error) {
        if (process.env.DEBUG_CHANNEL_ID && process.env.ADMIN_ID) {
            sendDebugMessage(`Error sending weekly statistic! <@${process.env.ADMIN_ID}>`, "", true)
        }
        console.error(error);
        return false;
    }
};

export const showMonthStatistic = async (channel_ID: string | undefined): Promise<boolean> => {
    //Returns the monthly sum message
    try {
        if (!channel_ID) {
            throw new Error("Undefined channel ID!");
        }

        const monthlyTime = getJSONContent(MONTH_TIMES_PATH) as monthlyTimeJSON;
        const userTime = getJSONContent(USER_TIMES_PATH) as userTimeJSON;

        if (monthlyTime && userTime) {
            let message = "Hello! The monthly sum of calls is here:\n";
            let total = 0;

            for (const userID in monthlyTime) {
                const actualTime = new Date().getTime()
                const currentTime = (userTime[userID].join_time != "") ? Math.floor((actualTime - new Date(userTime[userID].join_time).getTime()) / 1000) : 0

                const usertimeSpent =
                    Number(monthlyTime[userID].time) +
                    Number(userTime[userID].time) + 
                    currentTime;

                const sessions = Number(userTime[userID].sessionCount) + Number(monthlyTime[userID].sessionCount) + (userTime[userID].join_time != "" ? 1 : 0)
                if (usertimeSpent > 0 && sessions > 0) {
                    message += `<@${userID}> spent ${formatTimeData(usertimeSpent)} in call, during ${sessions.toString()} sessions, with average call time: ${formatTimeData(Number(Math.floor((usertimeSpent / Number(sessions)))))}\n`;
                    total += usertimeSpent;
                }
            }

            if (total > 0) {
                message += `Total time spend in call this month is ${formatTimeData(
                    total
                )}. Thanks for your attention :)`;
            } else {
                message += "No members were in a call this month. :("
            }

            if (process.env.CHANNEL_ID) {
                return await sendMessageToChannel(
                    message,
                    channel_ID
                );
            }
        }

        return false;
    } catch (error) {
        if (process.env.ADMIN_ID) {
            sendDebugMessage(`Error sending monthly statistic! <@${process.env.ADMIN_ID}>`, "", true)
        }
        console.error(error);
        return false;
    }
};

export const clearWeeklyValues = (): boolean => {
    //Clears the weekly time of all users to 0
    try {
        const timeJSON = getJSONContent(USER_TIMES_PATH) as botData;

        for (const userID in timeJSON) {
            timeJSON[userID] = { time: "0", join_time: "", overflow: "0", sessionCount: "0" };
        }

        fs.writeFileSync(USER_TIMES_PATH, JSON.stringify(timeJSON), "utf-8");
        return true;
    } catch (error) {
        if (process.env.ADMIN_ID) {
            sendDebugMessage(`Error clearing weekly values! <@${process.env.ADMIN_ID}>`, "", true)
        }
        console.error(error);
        return false;
    }
}

export const clearMonthValues = (): boolean => {
    //Clears the monthly time of all users to 0
    try {
        const timeJSON = getJSONContent(MONTH_TIMES_PATH) as botData;

        for (const userID in timeJSON) {
            timeJSON[userID] = { time: "0", sessionCount: "0" };
        }

        fs.writeFileSync(MONTH_TIMES_PATH, JSON.stringify(timeJSON), "utf-8");
        return true;
    } catch (error) {
        if (process.env.ADMIN_ID) {
            sendDebugMessage(`Error clearing monthly values! <@${process.env.ADMIN_ID}>`, "", true)
        }
        console.error(error);
        return false;
    }
};

export const addWeeklySum = (): boolean => {
    //Adds weekly sum to monthly sum
    try {
        const userTime = getJSONContent(USER_TIMES_PATH) as userTimeJSON;
        const monthlyTime = getJSONContent(MONTH_TIMES_PATH) as monthlyTimeJSON;

        for (const userID in userTime) {
            monthlyTime[userID] = {
                time: (
                    Number(monthlyTime[userID].time) +
                    Number(userTime[userID].time) - Number(userTime[userID].overflow)
                ).toString(),
                sessionCount: (Number(monthlyTime[userID].sessionCount) + Number(userTime[userID].sessionCount)).toString()
            };
        }

        fs.writeFileSync(
            MONTH_TIMES_PATH,
            JSON.stringify(monthlyTime),
            "utf-8"
        );
        return true;
    } catch (error) {
        if (process.env.ADMIN_ID) {
            sendDebugMessage(`Error adding weekly sum! <@${process.env.ADMIN_ID}>`, "", true)
        }
        console.error(error);
        return false;
    }
};

export const sendMessageToChannel = async (
    //Sends message to specified channel
    message: string,
    channelID: string
): Promise<boolean> => {
    const channel = (await client.channels.fetch(channelID)) as TextChannel;

    if (channel) {
        channel.send(message);
        return true;
    }
    return false;
};

export const sendDebugMessage = (
    successMessage: string,
    errorMessage: string,
    condition: boolean
) => {
    if (process.env.DEBUG_CHANNEL_ID) {
        if (condition) {
            if (successMessage != "") {
                sendMessageToChannel(successMessage, process.env.DEBUG_CHANNEL_ID);
            }
        } else {
            if (errorMessage != "") {
                sendMessageToChannel(errorMessage, process.env.DEBUG_CHANNEL_ID);
            }
        }
    }
};

const formatTimeData = (data: number): string => {
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

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
    if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
    if (seconds > 0) parts.push(`${seconds} ${seconds === 1 ? "second" : "seconds"}`);

    return parts.join(" ");
};
