import eddyproDto from "../dto/EddyproDto";
import config from "../config/config";

/**
 * 가스 분석기 검색 service
 * @param {string} startDatetime - 검색조건 : 시작시간
 * @param {string} endDatetime - 검색조건 : 종료시간
 * @param {string} type - 검색조건 : 측정종류
 * @returns {Promise<any>} - 검색 결과
 */
const eddyproService: (startDatetime: string, endDatetime: string, type: string) => Promise<any> = async (startDatetime, endDatetime, type) => {
    
    // 결과용 변수 정의
    let result: { statusCode : number, error: string | undefined, count: number, data: any[] | null } 
        = { statusCode : 0, error: "", count: 0, data: [] };

    const types = config.eddyproTypes;

    try {

        // 검색 조건 - 측정종류 체크
        if(!types.includes(type) && type != "ALL") {
            throw Error;
        }

        return await eddyproDto(startDatetime, endDatetime, type);

    } catch(error) {

        result.statusCode = 400;
        result.error = "Bad Request";
        return result;
        
    }

};

export default eddyproService;
