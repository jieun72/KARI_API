import { floxDto, floxRefDto} from "../dto/FloxDto";
import config from "../config/config";
import { convertKSTToUTC } from "../common/common";

/**
 * Flox sys 검색 service
 * @param {string} startDatetime - 검색조건 : 시작시간
 * @param {string} endDatetime - 검색조건 : 종료시간
 * @returns {Promise<any>} - 검색 결과
 */
export const floxService: (startDatetime: string, endDatetime: string, type: string) => Promise<any> = async (startDatetime, endDatetime, type) => {
    
    // 결과용 변수 정의
    let result: { statusCode : number, error: string | undefined, count: number, data: any[] | null } 
        = { statusCode : 0, error: "", count: 0, data: [] };

    const types = config.floxTypes;
    
    try {

        // 검색 조건 - 측정종류 체크
        if(!types.includes(type) && type != "REF_FULL" && type != "REF_FLUO" && type != "ALL") {
            throw Error;
        }
        
        if(type == "R") {
            type = "Red";
        } else if(type == "G") {
            type = "Green";
        } else if(type == "B") {
            type = "Blue";
        }

        startDatetime = await convertKSTToUTC(startDatetime);
        endDatetime = await convertKSTToUTC(endDatetime);
        
        return await floxDto(startDatetime, endDatetime, type);

    } catch(error) {

        result.statusCode = 400;
        result.error = "Bad Request";
        return result;
        
    }

};

/**
 * Flox sys Ref,파장 검색 service
 * @param {string} startDatetime - 검색조건 : 시작시간
 * @param {string} endDatetime - 검색조건 : 종료시간
 * @returns {Promise<any>} - 검색 결과
 */
 export const floxRefService: (startDatetime: string, endDatetime: string, xMin: string, xMax: string) => Promise<any> = async (startDatetime, endDatetime, xMin, xMax) => {
    
    // 결과용 변수 정의
    let result: { statusCode : number, error: string | undefined, count: number, data: any[] | null } 
        = { statusCode : 0, error: "", count: 0, data: [] };
 
    try {

        startDatetime = await convertKSTToUTC(startDatetime);
        endDatetime = await convertKSTToUTC(endDatetime);
        
        return await floxRefDto(startDatetime, endDatetime, xMin, xMax);

    } catch(error) {

        result.statusCode = 400;
        result.error = "Bad Request";
        return result;
        
    }

};