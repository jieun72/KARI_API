import { NextFunction, Router } from "express";
import ms700Service from "../../services/Ms700Service";

const router = Router();

/**
 * 초분광 복사계 검색 controller
 * @param {Request} request - request
 * @param {Response} response - response
 */
router.get("/", async (request, response, next) => {
    
    const startDatetime: string = request.query.startDatetime as string;
    const endDatetime: string = request.query.endDatetime as string;
   
    response.json(await ms700Service(startDatetime, endDatetime));
    
});

export default router;
