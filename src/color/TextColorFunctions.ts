import { TextColor } from "./TextColor";
import { Editor } from "obsidian";
import { EditorView } from "@codemirror/view";
import { textColorParserField } from "../rendering/TextColorStateField";

export function applyColor(tColor: TextColor, editor: Editor) {

	let prefix = `~={${tColor.id}}`;
	let suffix = `=~`;

	// nothing is selected, just insert coloring
	if (!editor.somethingSelected()) {
		editor.replaceSelection(prefix);

		let pos = editor.getCursor();
		// console.log(`line: ${pos.line}, ch: ${pos.ch}`);
		editor.replaceSelection(suffix);

		editor.setCursor(pos);

		// push a scope onto the stack to be able to jump out with tab
		// this made more Problems than it was worth... maybe readd later.

		// let scope = CreateCaptureScope(editor, this.app, pos, suffix);

		// this.app.keymap.pushScope(scope);
		return;
	}

	let selected = editor.getSelection();

	// TODO check if there already is some coloring applied somewhere near.
	// for now just check if what is marked is already a colored section and trim tags:
	// if (selected.match(IS_COLORED)) {
	// 	selected = selected.replace(LEADING_SPAN, '');
	// 	selected = selected.replace(TRAILING_SPAN, '');
	// }

	let coloredText = `${prefix}${selected}${suffix}`;

	editor.replaceSelection(coloredText);

	// move cursor one item to the right.
	// could not find a way to query for last possible position, so trycatch is needed.
	try {
		let pos = editor.getCursor();
		pos.ch = pos.ch + 1;
		editor.setCursor(pos);
	} catch {
		return;
	}
}

/**
 * Removes the color for the text tha the cursor in in.
 *
 * @param {Editor} editor 
 * @param {EditorView} view
 */
export function removeColor(editor: Editor, view: EditorView) {
	// for now only works if span is leading and trailing

	const tree = view.state.field(textColorParserField).tree;

	let node = tree.resolveInner(view.state.selection.main.head);

	while (node.parent != null) {
		if (node.type.name != "Expression") {
			node = node.parent;
			continue;
		}

		const TcLeft = node.getChild("TcLeft");
		const Rmarker = node.getChild("TcRight")?.getChild("REnd")?.getChild("RMarker");

		view.dispatch({
			changes: [{
				from: TcLeft ? TcLeft.from : 0,
				to: TcLeft ? TcLeft.to : 0,
				insert: ''
			}, {
				from: Rmarker ? Rmarker.from : 0,
				to: Rmarker ? Rmarker.to : 0,
				insert: ''
			}
			]
		})

		return;
	}

	return;
}
