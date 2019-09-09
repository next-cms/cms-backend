import * as path from "path";

export function getNextServerConfig(projectDir) {
    return require(`../../../${path.join(projectDir, "next.config.js")}`);
}
