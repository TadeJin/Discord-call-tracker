type userTime = {
    time: string;
    join_time: Date | string;
    overflow: string;
    sessionCount: string;
};

type monthlyTime = {
    time: string;
    sessionCount: string;
};

export type userTimeJSON = Record<string, userTime>;
export type monthlyTimeJSON = Record<string, monthlyTime>;

export type botData = userTimeJSON | monthlyTimeJSON;