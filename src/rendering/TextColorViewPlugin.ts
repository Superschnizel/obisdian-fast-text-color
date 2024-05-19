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
import { MarkerWidget } from "../widgets/MarkerWidget"
import { SyntaxNodeRef } from "@lezer/common"
import { ColorWidget } from "src/widgets/ColorWidget";
import { CSS_COLOR_PREFIX, getCurrentTheme } from "../FastTextColorSettings";
import { settingsFacet } from "src/SettingsFacet";
import { editorInfoField, editorLivePreviewField, MarkdownView } from "obsidian";

class TextColorViewPlugin implements PluginValue {
	decorations: DecorationSet;
	notLivePreview: boolean;

	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view);
	}

	update(update: ViewUpdate) {
		// console.log(`update: ${isLivePreview(update.state)} ${update.docChanged ? "docChanged" : ''}${update.viewportChanged ? "viewportChanged" : ''}${update.focusChanged ? "focusChanged" : ''}${update.selectionSet ? "selectionSet" : ''}${update.geometryChanged ? "geometryChanged" : ''}${update.changes.desc.toJSON()}`);
		
		if (!isLivePreview(update.state)) {
			// clear decorations
			if (this.decorations.size > 0) {
				this.decorations = new RangeSetBuilder<Decoration>().finish();
			}
			this.notLivePreview = true;

			return;
		}

		// this is a hack to enable instant switch when source mode is turned of.
		// TODO: maybe there is a better way of handling all this.
		if (this.notLivePreview) {

			this.notLivePreview = false;
			this.decorations = this.buildDecorations(update.view);
			return;
		}

		if (update.docChanged || update.viewportChanged || update.selectionSet) {
			
			this.decorations = this.buildDecorations(update.view);
		}


	}

	destroy() { }

	buildDecorations(view: EditorView): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();

		// console.log('building decorations')
		// console.log(`viewport: ${view.viewport.from}-${view.viewport.to}`)
		//
		// console.log(settings.version);

		for (let { from, to } of view.visibleRanges) {
			view.state.field(textColorParserField).tree.iterate({
				from,
				to,
				enter(node) {

					// if top node we have to go deeper.
					if (node.type.name == "TextColor") {
						return true;
					}

					// only top node and expression interests us.
					if (node.type.name != "Expression") {
						return false;
					}

					// const cursorInside = view.state.selection.main.from <= node.to && view.state.selection.main.to >= node.from;

					handleExpression(node, builder, view.state);

					return false;
				},
			});
		}

		return builder.finish();
	}
}

function isLivePreview(state: EditorState): boolean {
	// @ts-ignore some strange private field not being assignable
	return state.field(editorLivePreviewField).valueOf();
}

/**
 * handel an Expression Node, parse it and assing the decorations.
 *
 * @param {SyntaxNodeRef} ExpressionNode - The Expression Node.
 * @param {RangeSetBuilder<Decoration>} builder - the builder used for the decorations.
 * @param {EditorState} state
 */
function handleExpression(ExpressionNode: SyntaxNodeRef, builder: RangeSetBuilder<Decoration>, state: EditorState) {
	// console.log("handling expression")

	const from = ExpressionNode.from;
	let colorStack: { color: string, inside: boolean }[] = []; // handle recursive coloring with stack

	const stateFrom = state.selection.main.from;
	const stateTo = state.selection.main.to;
	const settings = state.facet(settingsFacet);

	// figure out the used theme either from properties or settings.
	const frontmatterTheme = getThemeFromFrontmatter(state);
	const themeName = frontmatterTheme == '' ? getCurrentTheme(settings).name : frontmatterTheme;

	ExpressionNode.node.toTree().iterate({ // toTree allocates a tree, this might be a point of optimization. TODO optimization
		enter(node) {
			// console.log(node.name)

			switch (node.type.name) {
				case "RMarker":
					let inside = colorStack.pop()?.inside;
					if (inside) {
						return true;
					}

					builder.add(node.from + from, node.to + from, Decoration.replace({ widget: new MarkerWidget(), block: false }))
					return true;

				case "EOF":
				case "ENDLN":
					colorStack.pop()?.inside;
					return true;

				case "TcLeft":
					if (colorStack.last()?.inside) {
						return true;
					}

					builder.add(node.from + from, node.to + from, Decoration.replace({ widget: new MarkerWidget(), block: false }))
					return true;

				case "Color":
					// console.log('color')
					let color = state.sliceDoc(from + node.from, from + node.to);
					colorStack[colorStack.length - 1].color = color;

					if (colorStack.last()?.inside && settings.interactiveDelimiters) {
						// console.log("building")
						if (stateFrom <= from + node.to && stateTo >= from + node.from) {
							return true;
						}


						builder.add(node.from + from, node.to + from, Decoration.replace({ widget: new ColorWidget(color, node.from + from, node.to + from, ExpressionNode.to), block: false }))
					}

					return true;

				case "Text":
					builder.add(node.from + from, node.to + from, Decoration.mark({ class: `${CSS_COLOR_PREFIX}${themeName}-${colorStack[colorStack.length - 1].color}` }))
					return false;

				case "Expression":
					colorStack.push({ color: '', inside: stateFrom <= from + node.to && stateTo >= from + node.from })
					return true;

				default:
					break;
			}
		},
	})

}

/**
 * Get the theme name from the frontmatter if possible.
 *
 * @param {EditorState} state 
 * @returns {string} the theme name if found, else empty string.
 */
function getThemeFromFrontmatter(state:EditorState) : string {
	const editorInfo = state.field(editorInfoField);
	const file = ( editorInfo as MarkdownView).file;

	if (!file) {
		return '';
	}

	const frontmatter = editorInfo.app.metadataCache.getFileCache(file)?.frontmatter;
	if (!frontmatter) {
		return '';
	}

	const name = frontmatter["ftcTheme"];

	return name ? name : '';
}

const pluginSpec: PluginSpec<TextColorViewPlugin> = {
	decorations: (value: TextColorViewPlugin) => value.decorations,
};

export const textColorViewPlugin = ViewPlugin.fromClass(
	TextColorViewPlugin,
	pluginSpec
);
