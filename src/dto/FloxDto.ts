import config from "../config/config";
import { FluxTableMetaData, HttpError, InfluxDB } from "@influxdata/influxdb-client";

/**
 * Flox sys 검색 dto
 * @param {string} startDatetime - 검색조건 : 시작시간
 * @param {string} endDatetime - 검색조건 : 종료시간
 * @param {string} type - 검색조건 : 측정종류
 * @returns {Promise<any>} - 검색결과
 */
export const floxDto : (startDatetime: string, endDatetime: string, type: string) => Promise<any> = async (startDatetime, endDatetime, type) => {
    
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
              |> filter(fn: (r) => r._measurement == "flox")
              |> filter(fn: (r) => r["_field"] == "vars")
        `
    );

    // 해당하는 측정 종류만 검색(전체검색이 아닐 경우)
    if(type != "ALL") {
        query += `      |> filter(fn: (r) => r["name"] == "${type}") `;
    }

    console.info(query);
    
    result.data = [];

    return await new Promise(resolve => queryApi.queryRows(query, {
        next(row: string[], tableMeta: FluxTableMetaData) {
            // 검색 결과 처리
            const o = tableMeta.toObject(row);
            let type = "";

            if(o.name == "Red") {
                o.name = "R";
            } else if(o.name == "Green") {
                o.name = "G";
            } else if(o.name == "Blue") {
                o.name = "B";
            }

            if(o._value == -999) {
                // null값 처리
                o._value = -9999;
            }

            const item = {
                type: o.name,
                time: o._time,
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

/**
 * Flox sys Ref,파장 검색 dto
 * @param {string} startDatetime - 검색조건 : 시작시간
 * @param {string} endDatetime - 검색조건 : 종료시간
 * @param {string} xMin - 검색조건 : 파장 최솟값
 * @param {string} xMax - 검색조건 : 파장 최댓값
 * @returns {Promise<any>} - 검색결과
 */
 export const floxRefDto : (startDatetime: string, endDatetime: string, xMin: string, xMax: string) => Promise<any> = async (startDatetime, endDatetime, xMin, xMax) => {
    
    const url = config.url
    const token = config.token

    const client = new InfluxDB({ url, token });
    const queryApi = client.getQueryApi(config.org);

    // 결과용 변수 정의
    let result: { statusCode : number, error: string | undefined, count: number, data: any[] | null } 
        = { statusCode : 0, error: "", count: 0, data: null };

    // TODO: 추후 FlOX로 수정 / 추후 name 타입 수정 있을수도
    // influxDB 쿼리 작성
    let query = new String(
        `
            from(bucket: "${config.bucket}")
              |> range(start: ${startDatetime}, stop: ${endDatetime})
              |> filter(fn: (r) => r._measurement == "Ms700")
              |> filter(fn: (r) => r["_field"] == "ref_length")
        `
    );

    if(xMin != null && xMax != null) {
        query += `      |> map(
                    fn: (r) => ({r with
                        level: float(v : r.name) >= ${xMin} and float(v : r.name) <= ${xMax}
                    })
                )
              |> filter(fn: (r) => r["level"] == true)`
    }

    console.info(query);
    
    result.data = [];

    return await new Promise(resolve => queryApi.queryRows(query, {
        next(row: string[], tableMeta: FluxTableMetaData) {
            // 검색 결과 처리
            const o = tableMeta.toObject(row);

            if(o._value == -999) {
                // null값 처리
                o._value = -9999;
            }

            const item = {
                time: o._time,
                xValue: o.name,
                yValue: o._value
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
