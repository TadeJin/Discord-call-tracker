import path from "path";
import fs from "fs";

export const addNewUser = (userID: string) => {
    try {
        const filePath = path.join(__dirname, "..","botConfig", "userTimes.json");
        const folderPath = path.join(__dirname, "..","botConfig")

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, {recursive: true})
        }

        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify({}), "utf-8");
        }

        const fileContent = fs.readFileSync(filePath, "utf-8").trim() ;
        const userTimes = fileContent ? JSON.parse(fileContent) : {};

        userTimes[userID] = { time: "0" };

        fs.writeFileSync(filePath, JSON.stringify(userTimes), "utf-8");
    } catch (error) {
        console.log(error);
        return false
    }

    return true
};
