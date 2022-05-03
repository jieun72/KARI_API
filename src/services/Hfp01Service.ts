import hfp01Dto from "../dto/Hfp01Dto";

/**
 * 토양열 플럭스 센서 service
 * @param {string} startDatetime - 검색조건 : 시작시간
 * @param {string} endDatetime - 검색조건 : 종료시간
 * @returns {Promise<any>} - 검색 결과
 */
const hfp01Service: (startDatetime: string, endDatetime: string) => Promise<any> = async (startDatetime, endDatetime) => {
    
    // 결과용 변수 정의
    let result: { statusCode : number, error: string | undefined, count: number, data: any[] | null } 
        = { statusCode : 0, error: "", count: 0, data: [] };

    try {

        return await hfp01Dto(startDatetime, endDatetime);

    } catch(error) {

        result.statusCode = 400;
        result.error = "Bad Request";
        return result;
        
    }

};

export default hfp01Service;
