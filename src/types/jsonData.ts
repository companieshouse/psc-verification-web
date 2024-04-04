/* eslint-disable no-use-before-define */

interface JSONArray extends Array<JSONValue> { }

export interface JSONObject {
    [x: string]: JSONValue;
}

type JSONValue =
    | string
    | number
    | boolean
    | JSONObject
    | JSONArray;
