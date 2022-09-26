import config from "../config/config";
import { FluxTableMetaData, HttpError, InfluxDB } from "@influxdata/influxdb-client";
import { convertUTCToKST } from "../common/common";

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
        async next(row: string[], tableMeta: FluxTableMetaData) {
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


    // name리스트 작성
    let nameListQuery = new String(`
        import "influxdata/influxdb/schema"
        schema.measurementTagValues(bucket: "KARI_NEW", measurement: "flox", tag: "name")
    `);

    console.info(nameListQuery);

    let nameList: number[] = [];

    // 1. name 리스트 추출
    await new Promise(resolve => queryApi.queryRows(nameListQuery, {
        next(row: string[], tableMeta: FluxTableMetaData) {
            // 검색 결과 처리
            const o = tableMeta.toObject(row);

            // 숫자 데이터만 사용
            if(!isNaN(Number(o._value))) {
                nameList.push(Number(o._value));
            }

        },
        error(error: HttpError) {
            // 에러 발생 시 - 에러코드, 에러메시지 리턴
            result.error = error.statusMessage;
            result.statusCode = error.statusCode;
            console.error(error);

            return result;
        },
        complete() {
            // 정상 종료 시 - 다음 처리 실시
            nameList.sort((objA, objB) => objA - objB);
            resolve(nameList);
        }
    }));

    // 2. 갯수 비교 처리용 변수 처리
    var abs1 = 0
    var abs2 = 0
    var nMin = Number(xMin);
    var nMax = Number(xMax);
    var min = 2000;
    var min2 = 2000;
    var rMin = 0;
    var rMax = 0;
    var minIndex = 0;
    var maxIndex = 0;

    // API 검색조건 최솟값, 최댓값이 범위를 벗어난 경우, 에러 처리
    if(nMin < nameList[0] || nMax > nameList[nameList.length - 1]) {
        result.statusCode = 400;
        result.error = "Bad Request";
        return result;
    }
    
    // API 검색조건 최솟값, 최댓값과 가장 가까운 r.name 추출
    for(var i = 0; i < nameList.length; i++) {
        abs1 = ((nameList[i] - nMin) < 0) ?
                -(nameList[i] - nMin) : (nameList[i] - nMin);

        abs2 = ((nameList[i] - nMax) < 0) ?
                -(nameList[i] - nMax) : (nameList[i] - nMax);

        if(abs1 < min) {
            min = abs1;
            rMin = nameList[i]; // 입력값 xMin과 가장 가까운 값
            minIndex = i; // rMin의 인덱스값
        }
        if(abs2 < min2) {
            min2 = abs2
            rMax = nameList[i]; // 입력값 xMax와 가장 가까운 값
            maxIndex = i; // rMax의 인덱스값
        }
    }
    
    // 쿼리용 변수 정의
    let searchArr: number[] = [];
    var sIndex = minIndex;

    // 3. 간격 처리 로직
    if((maxIndex - minIndex) / 50 < 1) {
        // 간격 총갯수 50개 미만의 경우, 에러 처리
        result.statusCode = 400;
        result.error = "Bad Request";
        return result;
    } else {
        var interval = (maxIndex - minIndex) / 50;
        
        // 간격(interval) 별 인덱스 추출 & 배열 작성
        for(var j = 0; j <= (maxIndex - minIndex) / interval; j++) {
            searchArr.push(nameList[sIndex]);
            
            sIndex += interval;
            sIndex = Math.round(sIndex);
            
            if(sIndex > maxIndex) {
                break;
            }
        }
    }

    // 4. influxDB 쿼리 작성
    let query = new String(
        `
            from(bucket: "${config.bucket}")
              |> range(start: ${startDatetime}, stop: ${endDatetime})
              |> filter(fn: (r) => r._measurement == "flox")
              |> filter(fn: (r) => r["_field"] == "ref")
              |> filter(fn: (r) => `
    );

    for(var k = 0; k < searchArr.length; k++) {
        query += `r["name"] == "` + searchArr[k] + `"`;

        if(k < searchArr.length - 1) {
            query += ` or `;
        } else {
            query += `)`;
        }
    }

    query += `
               |> aggregateWindow(every: 1h, fn: last, createEmpty: false)
               |> yield(name: "last")`;


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
            result.data?.sort((objA, objB) => new Date(objA.time).getTime() - new Date(objB.time).getTime());
            resolve(result); 
        }
    }));
};
