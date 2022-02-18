import * as mysql from "mysql";
import dayjs from "dayjs";

const connection = mysql.createConnection({
    host: "192.168.1.252",
    user: "root",
    password: "55555",
    database: "test"
});

const queryMySQL: (startDatetime: string, endDatetime: string, aggregateOption: { every: string, fn: string } | null) => Promise<any> = async (startDatetime, endDatetime, aggregateOption) => {
    let every: string = "t_time", fn: string = "value";
    if (aggregateOption) {
        switch (aggregateOption.every) {
        case "year": every = "SUBSTR(t_time, 1, 4)"; break;
        case "month": every = "SUBSTR(t_time, 1, 6)"; break;
        case "day": every = "SUBSTR(t_time, 1, 8)"; break;
        case "hour": every = "SUBSTR(t_time, 1, 10)"; break;
        case "minute": every = "SUBSTR(t_time, 1, 12)"; break;
        default: every = "t_time"; break;
        }
        switch (aggregateOption.fn) {
        case "mean": fn = "AVG(value)"; break;
        case "min": fn = "MIN(value)"; break;
        case "max": fn = "MAX(value)"; break;
        case "sum": fn = "SUM(value)"; break;
        case "count": fn = "COUNT(value)"; break;
        default: fn = "value"; break;
        }
    }

    let result: {
        query: string,
        count: number,
        data: any[] | null,
        execution: string,
        error: Error | null
    } = {
        query: `
        
            SELECT
                ${every} AS t_time,
                name,
                ${fn} AS value
            FROM time_test
            WHERE t_time
                BETWEEN '${startDatetime}'
                AND '${endDatetime}'
            GROUP BY
                ${every},
                name
              
              `,
        count: 0,
        data: null,
        execution: "",
        error: null
    };

    console.log(result.query);

    const begin = new Date().getTime();
    connection.connect();
    result = await new Promise(resolve => connection.query(result.query, (error: mysql.MysqlError | null, results, fields) => {
        const end = new Date().getTime();
        if (error) {
            result.error = error;
            resolve(result);
            return;
        }
        result.count = results.length;
        result.data = results;
        result.execution = `${(end - begin) / 1000}s`;
        resolve(result);
    }));
    connection.end();
    return result;
}

export default queryMySQL;
