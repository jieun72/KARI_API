import config from "../config/config";
import { FluxTableMetaData, HttpError, InfluxDB } from "@influxdata/influxdb-client";
import { convertUTCToKST } from "../common/common";

/**
 * 토양열 플럭스 센서 검색 dto
 * @param {string} startDatetime - 검색조건 : 시작시간
 * @param {string} endDatetime - 검색조건 : 종료시간
 * @returns {Promise<any>} - 검색결과
 */
const hfp01Dto : (startDatetime: string, endDatetime: string| null) => Promise<any> = async (startDatetime, endDatetime) => {
    
    const url = config.url
    const token = config.token

    const client = new InfluxDB({ url, token });
    const queryApi = client.getQueryApi(config.org);

    // 결과용 변수 정의
    let result: { statusCode : number, error: string | undefined, count: number, data: any[] | null } 
        = { statusCode : 0, error: "", count: 0, data: null };

    // influxDB 쿼리 작성
    let query = new String(
        `
            from(bucket: "${config.bucket}")
              |> range(start: ${startDatetime}, stop: ${endDatetime})
              |> filter(fn: (r) => r._measurement == "hfp01")
              |> filter(fn: (r) => r["_field"] == "vars")
              |> filter(fn: (r) => r["name"] == "soil_heat_flux_Avg")
        `
    );

    console.info(query);
    
    result.data = [];

    return await new Promise(resolve => queryApi.queryRows(query, {
        async next(row: string[], tableMeta: FluxTableMetaData) {
            // 검색 결과 처리
            const o = tableMeta.toObject(row);
            if(o._value == -999) {
                // null값 처리
                o._value = -9999;
            }
            const item = {
                time: await convertUTCToKST(o._time),
                value: o._value
            };

            result.count += 1;
            result.data?.push(item);
        },
        error(error: HttpError) {
            // 에러 발생 시 - 에러코드, 에러메시지 리턴
            result.error = error.statusMessage;
            result.statusCode = error.statusCode;
            console.error(error);
            resolve(result);
        },
        complete() {
            // 정상 종료 시 - 정상코드(200), 결과 리턴
            result.statusCode = 200;
            resolve(result);
        }
    }));
};

export default hfp01Dto;
