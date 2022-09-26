import ms700Dto from "../dto/Ms700Dto";
import { convertKSTToUTC } from "../common/common";

/**
 * 초분광 복사계 검색 service
 * @param {string} startDatetime - 검색조건 : 시작시간
 * @param {string} endDatetime - 검색조건 : 종료시간
 * @returns {Promise<any>} - 검색 결과
 */
const ms700Service: (startDatetime: string, endDatetime: string) => Promise<any> = async (startDatetime, endDatetime) => {
    
    // 결과용 변수 정의
    let result: { statusCode : number, error: string | undefined, count: number, data: any[] | null } 
        = { statusCode : 0, error: "", count: 0, data: [] };

    try {

        startDatetime = await convertKSTToUTC(startDatetime);
        endDatetime = await convertKSTToUTC(endDatetime);

        return await ms700Dto(startDatetime, endDatetime);

    } catch(error) {

        result.statusCode = 400;
        result.error = "Bad Request";
        return result;
        
    }

};

export default ms700Service;
