import { animate, spring } from "motion";
import { baseKeymap } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { Schema } from "prosemirror-model";
import {
	Command,
	EditorState,
	Selection,
	TextSelection,
} from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import React, {
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";

const schema = new Schema({
	nodes: {
		doc: {
			content: "text*",
		},
		text: {},
	},
});

const initialDoc = schema.nodes.doc.create({}, schema.text("Hello, Twitter"));

const moveLeft: Command = (state, dispatch) => {
	const newSelection = state.selection.head - 1;
	if (newSelection < 0) return false;
	const resolvedPos = state.doc.resolve(newSelection);
	dispatch?.(state.tr.setSelection(new TextSelection(resolvedPos)));
	return false;
};

const moveRight: Command = (state, dispatch) => {
	const newSelection = state.selection.head + 1;
	if (newSelection > state.doc.content.size) return false;
	const resolvedPos = state.doc.resolve(newSelection);
	dispatch?.(state.tr.setSelection(new TextSelection(resolvedPos)));
	return false;
};

export function AnimatedEditor() {
	const [editable, setEditable] = useState(false);
	const [editorState, setEditorState] = useState(
		EditorState.create({
			schema,
			doc: initialDoc,
			selection: Selection.atEnd(initialDoc),
			plugins: [
				keymap({ ...baseKeymap, ArrowRight: moveRight, ArrowLeft: moveLeft }),
			],
		})
	);
	const [animationEnded, setAnimationEnded] = useState(true);

	const view = useMemo(
		() =>
			new EditorView(null, {
				state: editorState,
				editable: () => editable,
				dispatchTransaction: (tr) => {
					const newState = view.state.apply(tr);
					console.log({ newState });
					setEditorState(newState);
				},
			}),
		[]
	);

	if (view.state !== editorState) view.updateState(editorState);

	const editorRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const editorNode = editorRef.current;

		if (!editorNode) return;

		editorNode.appendChild(view.dom);
	}, []);

	const animatedCursorState = view.state.selection;

	const cursorPos = view.coordsAtPos(animatedCursorState.from);

	useEffect(() => {
		if (editable) {
			animate(
				".editor",
				{
					padding: "8px",
					background: "hsl(210 16.7% 97.6%)",
					fontSize: "93%",
					color: "hsl(206 6% 35%)",
					border: "1.5px solid hsl(189 60.3% 52.5%)",
					caretColor: "transparent",
				},
				{ duration: 0.22, easing: spring() }
			).finished.then(() => {
				setAnimationEnded(false);
				const animatedCursorState = view.state.selection;

				const cursorPos = view.coordsAtPos(animatedCursorState.from);
				animate(
					".cursor",
					{
						top: `${cursorPos.top}px`,
						left: `${cursorPos.left}px`,
						opacity: 1,
					},
					{ duration: 0.04, easing: spring() }
				).finished.then(() => setAnimationEnded(true));
			});
		} else {
			animate(
				".cursor",
				{
					opacity: 0,
				},
				{ duration: 0.04, easing: spring() }
			);
			animate(
				".editor",
				{
					padding: "4px",
					background: "hsl(206 30% 98.8%)",
					color: "hsl(206 24% 9%)",
					border: "1.5px solid transparent",
				},
				{ duration: 0.22, easing: spring(), delay: 0.04 }
			);
		}
	}, [editable]);

	const showBlockCursor =
		animatedCursorState.empty &&
		animatedCursorState.head === editorState.doc.content.size;

	const selectionRect = useMemo(() => {
		const { head, anchor } = editorState.selection;
		const headRect = view.coordsAtPos(head);
		const anchorRect = view.coordsAtPos(anchor);

		const left = Math.min(headRect.left, anchorRect.left);
		const right = Math.max(headRect.right, anchorRect.right);
		const top = Math.min(headRect.top, anchorRect.top);
		const bottom = Math.max(headRect.bottom, anchorRect.bottom);

		const selectionRect = {
			top,
			height: bottom - top,
			left,
			width: right - left,
		};

		return selectionRect;
	}, [editorState.selection]);

	useEffect(() => {
		animate(
			".selectionRect",
			{ opacity: [0, 0.35] },
			{ duration: 0.27, easing: spring() }
		);
	}, [selectionRect]);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 10,
			}}
		>
			<button
				style={{ alignSelf: "start" }}
				onClick={() => {
					view.setProps({ editable: () => !editable });
					setEditable(!editable);
				}}
			>
				Toggle
			</button>
			<div
				ref={editorRef}
				// className={`editor ${view.editable ? "active" : "inactive"}`}
				className={`editor`}
			/>
			<div
				className="cursor"
				style={{
					width: showBlockCursor ? 10 : 2,
					height: 17.5,
					top: `${cursorPos.top}px`,
					left: `${cursorPos.left}px`,
					opacity: 1,
				}}
			></div>
			<div
				style={{
					position: "absolute",
					backgroundColor: "hsl(189 60.3% 60%)",
					opacity: 0.35,
					...selectionRect,
				}}
				className="selectionRect"
			></div>
		</div>
	);
}
