import config from "../config/config";
import { FluxTableMetaData, HttpError, InfluxDB } from "@influxdata/influxdb-client";
import { convertUTCToKST } from "../common/common";

/**
 * 장비별 수집율 검색 dto
 * @param {string} startDatetime - 검색조건 : 시작시간
 * @param {string} endDatetime - 검색조건 : 종료시간
 * @param {string} type - 검색조건 : 장비종류
 * @returns {Promise<any>} - 검색결과
 */
const collectionRateDto : (startDatetime: string, endDatetime: string, type: string) => Promise<any> = async (startDatetime, endDatetime, type) => {
    
    // TODO:Type별 대표 name 설정
    const keyValArray: {[key: string]: string} = {
        Ms700: "Red",
        aws: "t_hmp_Avg",
        cs451: "Lvl_cm_TMx",
        hfp01: "soil_heat_flux_Avg",
        li191: "LineQ1_Avg",
        si111: "IRT1_TargetTC_Avg",
        crn4: "CM3Up_Avg",
        flox: "SIF_A_ifld",
        pom02: "col1",
        eddypro: "wind_dir"
    }

    const url = config.url
    const token = config.token

    const client = new InfluxDB({ url, token });
    const queryApi = client.getQueryApi(config.org);

    // Type별 대표 name 가져오기
    const name = keyValArray[type];
    
    let vars = "";
    if(type == "pom02") {
        vars = "PWV";
    } else {
        vars = "vars";
    }

    // 결과용 변수 정의
    let result: { statusCode : number, error: string | undefined, count: number, data: any[] | null } 
        = { statusCode : 0, error: "", count: 0, data: null };

    // influxDB 쿼리 작성
    let query = new String(
        `
            from(bucket: "${config.bucket}")
              |> range(start: ${startDatetime}, stop: ${endDatetime})
              |> filter(fn: (r) => r._measurement == "${type}")
              |> filter(fn: (r) => r["_field"] == "${vars}")
              |> filter(fn: (r) => r["name"] == "${name}")
              |> aggregateWindow(every: 1d, fn: count)
        `
    );

    console.info(query);
    
    result.data = [];

    return await new Promise(resolve => queryApi.queryRows(query, {
        async next(row: string[], tableMeta: FluxTableMetaData) {
            // 검색 결과 처리
            const o = tableMeta.toObject(row);
            var cValue = 0;
            var returnTime;

            if(o._value > 0) {
                // 수집율 계산
                if(type == "Ms700") {
                    cValue = o._value / 288;
                } else if(type == "eddypro") {
                    cValue = o._value / 24;
                } else {
                    cValue = o._value / 144;
                }
            }
            if(type == "aws") {
                returnTime = o._time;
            } else {
                returnTime = await convertUTCToKST(o._time);
            }
            const item = {
                type: o._measurement,
                time: returnTime,
                value: cValue.toFixed(2)
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

export default collectionRateDto;
