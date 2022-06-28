import decache from "decache";
import { build } from "estrella";

const buildIndex = async () => {
	decache("./src/index");
	build({
		entry: ["./src/index.tsx"],
		outdir: "dist",
		sourceRoot: "src",
		bundle: true,
		minify: true,

		tslint: "on",
	}).catch(() => process.exit(1));
};

buildIndex();
