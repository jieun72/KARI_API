import dayjs from "dayjs";
import { FluxTableMetaData, InfluxDB } from "@influxdata/influxdb-client";

const url = "http://192.168.1.252:8086";
const token = "ZFkC-eqryZu6-udYhwWdMft_bNX0t6Lt-nqTUH755JJPjXkL0x5KPynkbKrUAg1uBr7RQXVdAeJCYP3GOKBnZw==";
const org = "WIZAI";
const bucket = "KARI";

const client = new InfluxDB({ url, token });
const queryApi = client.getQueryApi(org);

const queryInfluxDB: (startDatetime: string, endDatetime: string, aggregateOption: { every: string, fn: string } | null) => Promise<any> = async (startDatetime, endDatetime, aggregateOption) => {
    let every: string = "s", fn: string = "mean";
    if (aggregateOption) {
        switch (aggregateOption.every) {
        case "year": every = "y"; break;
        case "month": every = "mo"; break;
        case "day": every = "d"; break;
        case "hour": every = "h"; break;
        case "minute": every = "m"; break;
        default: every = "s"; break;
        }
        fn = aggregateOption.fn;
    }

    let result: {
        query: string,
        count: number,
        data: any[] | null,
        execution: string,
        error: Error | null
    } = {
        query: `
        
            from(bucket: "${bucket}")
              |> range(start: ${dayjs(startDatetime).format("YYYY-MM-DDTHH:mm:ss")}Z, stop: ${dayjs(endDatetime).format("YYYY-MM-DDTHH:mm:ss")}Z)
              |> filter(fn: (r) => r._measurement == "Ms700")
              |> aggregateWindow(every: 1${every}, fn: ${fn}, createEmpty: false)
              
              `,
        count: 0,
        data: null,
        execution: "",
        error: null
    };

    console.log(result.query);

    result.data = [];
    const begin = new Date().getTime();
    return await new Promise(resolve => queryApi.queryRows(result.query, {
        next(row: string[], tableMeta: FluxTableMetaData) {
            result.count += 1;
            result.data?.push(row);
        },
        error(error: Error) {
            result.error = error;
        },
        complete() {
            const end = new Date().getTime();
            result.execution = `${(end - begin) / 1000}s`;
            resolve(result);
        }
    }));
};

export default queryInfluxDB;
