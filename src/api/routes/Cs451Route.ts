import { NextFunction, Router } from "express";
import cs451Service from "../../services/Cs451Service";

const router = Router();

/**
 * 수심/수온 측정계 검색 controller
 * @param {Request} request - request
 * @param {Response} response - response
 */
router.get("/", async (request, response, next) => {
    
    // 시작시간
    const startDatetime: string = request.query.startDatetime as string;

    // 종료시간
    const endDatetime: string = request.query.endDatetime as string;

    // 측정종류
    const type: string = request.query.type as string;
   
    // 결과용 변수 정의
    let result: { statusCode : number, error: string | undefined, count: number, data: any[] | null } 
        = { statusCode : 0, error: "", count: 0, data: [] };

    // 필수 입력 체크
    if(startDatetime == null || startDatetime == "" || endDatetime == null || endDatetime == "" || type == null || type == "")  {
        result.statusCode = 400;
        result.error = "Bad Request";
        response.json(result);
        return;
    }

    response.json(await cs451Service(startDatetime, endDatetime, type));
    
});

export default router;
