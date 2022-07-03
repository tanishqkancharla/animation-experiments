import React from "react";
import ReactDOM from "react-dom";
import { AnimatedEditor } from "./AnimatedEditor";

function Index() {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
			<AnimatedEditor />
		</div>
	);
}

function run() {
	const container = document.createElement("main");
	document.body.appendChild(container);
	ReactDOM.render(<Index />, container);
}

if (typeof window !== "undefined") {
	// If in browser context
	run();
}
