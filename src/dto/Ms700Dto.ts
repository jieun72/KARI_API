import config from "../config/config";
import { FluxTableMetaData, HttpError, InfluxDB } from "@influxdata/influxdb-client";

/**
 * 초분광 복사계 검색 dto
 * @param {string} startDatetime - 검색조건 : 시작시간
 * @param {string} endDatetime - 검색조건 : 종료시간
 * @returns {Promise<any>} - 검색결과
 */
const ms700Dto : (startDatetime: string, endDatetime: string| null) => Promise<any> = async (startDatetime, endDatetime) => {
    
    const url = config.url
    const token = config.token

    const client = new InfluxDB({ url, token });
    const queryApi = client.getQueryApi(config.org);

    // 결과용 변수 정의
    let result: { statusCode : number, error: string | undefined, count: number, data: any[] | null } 
        = { statusCode : 0, error: "", count: 0, data: null };

    // influxDB 쿼리 작성
    // TODO: 추후에 _field->vars로 수정예정
    // TODO: 추후에 name 수정예정(확정되면)
    // TODO: 추후에 R,G,B 값 수정 예정(확정되면)
    let query = new String(
        `
            from(bucket: "${config.bucket}")
              |> range(start: ${startDatetime}Z, stop: ${endDatetime}Z)
              |> filter(fn: (r) => r._measurement == "Ms700")
              |> filter(fn: (r) => r["_field"] == "ref_length")
              |> filter(fn: (r) => r["name"] == "401.0" or r["name"] == "602.0" or r["name"] == "761.0")
        `
    );

    console.info(query);
    
    result.data = [];

    return await new Promise(resolve => queryApi.queryRows(query, {
        next(row: string[], tableMeta: FluxTableMetaData) {
            // 검색 결과 처리
            const o = tableMeta.toObject(row);
            let type = "";

            if(o.name == "401.0") {
                type = "R";
            } else if(o.name == "602.0") {
                type = "G";
            } else if(o.name == "761.0") {
                type = "B";
            }

            if(o._value == -999) {
                // null값 처리
                o._value = -9999;
            }
            
            const item = {
                type: type,
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

export default ms700Dto;
