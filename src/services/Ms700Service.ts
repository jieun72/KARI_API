import ms700Dto from "../dto/Ms700Dto";
import dayjs from "dayjs";

/**
 * 미세먼지 측정기기 리스트 service
 * @param {string} startDatetime - 검색조건 : 시작시간
 * @param {string} endDatetime - 검색조건 : 종료시간
 * @returns {Promise<any>} - 검색 결과
 */
const ms700Service: (startDatetime: string, endDatetime: string) => Promise<any> = async (startDatetime, endDatetime) => {
    
    // 검색 조건 - 날짜형식으로 변환
    let startDate = dayjs(startDatetime).format("YYYY-MM-DDTHH:mm:ss");
    let endDate = dayjs(endDatetime).format("YYYY-MM-DDTHH:mm:ss")
    
    return await ms700Dto(startDate, endDate);

};

export default ms700Service;
