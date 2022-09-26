import dayjs from "dayjs";

export const convertUTCToKST: (utcDatetime: string) => Promise<any> = async (utcDatetime) => {
    let date = new Date(utcDatetime)
    let convertDate = dayjs(date).format("YYYY-MM-DDTHH:mm:ss")
    return convertDate;

};

export const convertKSTToUTC: (kstDatetime: string) => Promise<any> = async (kstDatetime) => {

    let date = new Date(kstDatetime)
    let convertDate = date.toISOString();
    return convertDate;
};