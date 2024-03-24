import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder, EditorState } from "@codemirror/state";
import {
	Decoration,
	DecorationSet,
	EditorView,
	PluginSpec,
	PluginValue,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
} from "@codemirror/view";
import { textColorParserField } from "./TextColorStateField";
import { TextColorWidget } from "./widgets/TextColorWidget";
import { MarkerWidget } from "./widgets/MarkerWidget"
import { SyntaxNodeRef } from "@lezer/common"
import { CSS_COLOR_PREFIX } from "./FastTextColorSettings";

class TextColorViewPlugin implements PluginValue {
	decorations: DecorationSet;

	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view);
	}

	update(update: ViewUpdate) {
		if (update.docChanged || update.viewportChanged || update.selectionSet) {
			this.decorations = this.buildDecorations(update.view);
		}
	}

	destroy() { }

	buildDecorations(view: EditorView): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();

		// console.log('building decorations')

		for (let { from, to } of view.visibleRanges) {
			view.state.field(textColorParserField).tree.iterate({
				from,
				to,
				enter(node) {
					console.log(node.name);

					if (node.type.name == "TextColor") {
						return true;
					}


					if (node.type.name != "Expression") {
						return false;
					}

					const cursorInside = view.state.selection.main.from <= node.to && view.state.selection.main.to >= node.from;

					handleExpression(node, builder, view.state, cursorInside);

					return false;
				},
			});
		}

		return builder.finish();
	}
}

function handleExpression(ExpressionNode: SyntaxNodeRef, builder: RangeSetBuilder<Decoration>, state: EditorState, cursorInside: boolean) {
	// console.log("handling expression")

	let from = ExpressionNode.from;
	let colors: string[] = []; // handle recursive coloring with stack
	
	ExpressionNode.node.toTree().iterate({ // toTree allocates a tree, this might be a point of optimization. TODO
		enter(node) {
			console.log(node.name)

			switch (node.type.name) {
				case "RMarker":
					colors.pop();
				case "TcLeft":
					if (cursorInside) {
						return true;
					}

					builder.add(node.from + from, node.to + from, Decoration.replace({ widget: new MarkerWidget(), block: false }))
					return true;

				case "Color":
					// console.log('color')
					let color = state.sliceDoc(from + node.from, from + node.to);
					colors.push(color);
					return true;

				case "Text":
					builder.add(node.from + from , node.to + from, Decoration.mark({ class: `${CSS_COLOR_PREFIX}${colors[colors.length - 1]}` }))
					return false;

				case "Expression":
					cursorInside = state.selection.main.from <= from + node.to && state.selection.main.to >= from + node.from;
					return true;
				
				default:
					console.log('default')
					break;
			}
		},
	})

}

const pluginSpec: PluginSpec<TextColorViewPlugin> = {
	decorations: (value: TextColorViewPlugin) => value.decorations,
};

export const textColorViewPlugin = ViewPlugin.fromClass(
	TextColorViewPlugin,
	pluginSpec
);
