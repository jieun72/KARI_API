import cs451Dto from "../dto/Cs451Dto";
import config from "../config/config";
import { convertKSTToUTC } from "../common/common";

/**
 * 수심/수온 측정계 검색 service
 * @param {string} startDatetime - 검색조건 : 시작시간
 * @param {string} endDatetime - 검색조건 : 종료시간
 * @param {string} type - 검색조건 : 측정종류
 * @returns {Promise<any>} - 검색 결과
 */
const cs451Service: (startDatetime: string, endDatetime: string, type: string) => Promise<any> = async (startDatetime, endDatetime, type) => {
    
    // 결과용 변수 정의
    let result: { statusCode : number, error: string | undefined, count: number, data: any[] | null } 
        = { statusCode : 0, error: "", count: 0, data: [] };

    const types = config.cs451Types;

    try {

        // 검색 조건 - 측정종류 체크
        if(!types.includes(type) && type != "ALL" && type != "Water_Level" && type != "Water_Temp") {
            throw Error;
        }

        startDatetime = await convertKSTToUTC(startDatetime);
        endDatetime = await convertKSTToUTC(endDatetime);
        
        return await cs451Dto(startDatetime, endDatetime, type);

    } catch(error) {

        result.statusCode = 400;
        result.error = "Bad Request";
        return result;
        
    }

};

export default cs451Service;
