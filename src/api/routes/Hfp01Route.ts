import { NextFunction, Router } from "express";
import hfp01Service from "../../services/Hfp01Service";

const router = Router();

/**
 * 토양열 플럭스 센서 검색 controller
 * @param {Request} request - request
 * @param {Response} response - response
 */
router.get("/", async (request, response, next) => {
    
    // 시작시간
    const startDatetime: string = request.query.startDatetime as string;

    // 종료시간
    const endDatetime: string = request.query.endDatetime as string;
   
    // 결과용 변수 정의
    let result: { statusCode : number, error: string | undefined, count: number, data: any[] | null } 
        = { statusCode : 0, error: "", count: 0, data: [] };

    // 필수 입력 체크
    if(startDatetime == null || startDatetime == "" || endDatetime == null || endDatetime == "")  {
        result.statusCode = 400;
        result.error = "Bad Request";
        response.json(result);
        return;
    }

    response.json(await hfp01Service(startDatetime, endDatetime));
    
});

export default router;
