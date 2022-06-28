import * as path from "path";

/** Get the absolute path to a relative path from the project root */
export function rootPath(...args: Array<string>) {
	return path.join(__dirname, "..", ...args);
}
