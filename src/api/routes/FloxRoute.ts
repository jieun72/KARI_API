import { NextFunction, Router } from "express";
import { floxService, floxRefService } from "../../services/FloxService";

const router = Router();

/**
 * Flox sys 검색 controller
 * @param {Request} request - request
 * @param {Response} response - response
 */
router.get("/", async (request, response, next) => {
    
    // 시작시간
    const startDatetime: string = request.query.startDatetime as string;

    // 종료시간
    const endDatetime: string = request.query.endDatetime as string;

    const type: string = request.query.type as string;
    
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

    response.json(await floxService(startDatetime, endDatetime, type));
    
});

/**
 * Flox sys Ref,파장 검색 controller
 * @param {Request} request - request
 * @param {Response} response - response
 */
router.get("/getRefList", async (request, response, next) => {
    
    // 시작시간
    const startDatetime: string = request.query.startDatetime as string;

    // 종료시간
    const endDatetime: string = request.query.endDatetime as string;

    // x축 범위 min
    const xMin : string = request.query.xMin as string;

    // x축 범위 max
    const xMax : string = request.query.xMax as string; 
    
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

    response.json(await floxRefService(startDatetime, endDatetime, xMin, xMax));
    
});

export default router;
