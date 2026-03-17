import {RuleSetPayloadDTO} from "../utils/astToBackendDTO"
import { post } from "./http"

// Dump api calls here instead of the consumer.

export async function postRuleAst(ast: RuleSetPayloadDTO): Promise<Response> {
    return await post("https://yuxr9sytdf.execute-api.ap-southeast-2.amazonaws.com/dev/api/generate", ast);
}
