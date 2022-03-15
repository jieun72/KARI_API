import ms700Dto from "../dto/Ms700Dto";
import dayjs from "dayjs";

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

        // 검색 조건 - 날짜형식으로 변환
        let startDate = dayjs(startDatetime).format("YYYY-MM-DDTHH:mm:ss");
        let endDate = dayjs(endDatetime).format("YYYY-MM-DDTHH:mm:ss")
    
        return await ms700Dto(startDate, endDate);

    } catch(error) {

        result.statusCode = 400;
        result.error = "Bad Request";
        return result;
        
    }

};

export default ms700Service;