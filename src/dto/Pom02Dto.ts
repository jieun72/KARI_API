import config from "../config/config";
import { FluxTableMetaData, HttpError, InfluxDB } from "@influxdata/influxdb-client";
import { convertUTCToKST } from "../common/common";

/**
 * 대기 복사계 검색 dto
 * @param {string} startDatetime - 검색조건 : 시작시간
 * @param {string} endDatetime - 검색조건 : 종료시간
 * @param {string} type - 검색조건 : 측정종류
 * @returns {Promise<any>} - 검색결과
 */
const pom02Dto : (startDatetime: string, endDatetime: string, type: string) => Promise<any> = async (startDatetime, endDatetime, type) => {
    
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
              |> filter(fn: (r) => r._measurement == "pom02")
        `
    );

    // 해당하는 측정 종류만 검색(전체검색이 아닐 경우)
    if(type == "ALL") {
        query += `      |> filter(fn: (r) => r["_field"] == "AOT" or r["_field"] == "Oze" or r["_field"] == "PWV") `;
    } else if(type == "AOT") {
        query += `      |> filter(fn: (r) => r["_field"] == "AOT") `;
    } else if(type == "Oze") {
        query += `      |> filter(fn: (r) => r["_field"] == "Oze")
              |> filter(fn: (r) => r["name"] == "col1") `;
    } else if(type == "PWV") {
        query += `      |> filter(fn: (r) => r["_field"] == "PWV")
        |> filter(fn: (r) => r["name"] == "col1") `;
    } else {
        // wl_1~11
        query += `      |> filter(fn: (r) => r["_field"] == "AOT") 
              |> filter(fn: (r) => r["name"] == "${type}") `;
    }

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

            var rType = "";
            if(o._field == "AOT") {
                rType = o.name;
            } else {
                rType = o._field;
            }

            const item = {
                type: rType,
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

export default pom02Dto;
