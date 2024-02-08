import { CMInstances } from "./CmInstance";

export function consoleLog(id: string, message: any, ...optionalParams: any[]) {
    if (CMInstances[id].setup.debugLogs === true)
        console.log(message, ...optionalParams)
}
