import { NextFunction, Router } from "express";
import queryInfluxDB from "../api/influxdb";
import queryMySQL from "../api/mysql";

const router = Router();

router.get("/test", async (request, response, next) => {
    console.log('@@@' + request.query.json);
    const type: string = request.query.type as string;
    const startDatetime: string = request.query.startDatetime as string;
    const endDatetime: string = request.query.endDatetime as string;
    const every: string = request.query.every as string;
    const fn: string = request.query.fn as string;

    if (type === "influxdb")
        response.json(await queryInfluxDB(startDatetime, endDatetime, { every, fn }));
    else if (type === "mysql")
        response.json(await queryMySQL(startDatetime, endDatetime, { every, fn }));
});

router.get("/testMiddleware", (request, response, next) => {
    console.log('!!!' + request.query.json);
    response.status(200).json({ json: request.query.json });
})

export default router;
