import { MarkdownPostProcessorContext } from 'obsidian'
import { Tree } from "@lezer/common";
import { CSS_COLOR_PREFIX, FastTextColorPluginSettings, getCurrentTheme } from 'src/FastTextColorSettings';
import { PREFIX, SUFFIX } from 'src/utils/regularExpressions';

export const textColorPostProcessor = (el: HTMLElement, ctx: MarkdownPostProcessorContext, settings: FastTextColorPluginSettings) => {


	let themeName = ctx.frontmatter ? ctx.frontmatter["ftcTheme"] : null;
	themeName = themeName ? themeName : getCurrentTheme(settings).name;

	// This is a hacky way of doing this, but every other possibility seemed incredibly convoluted.
	// For now to handle the codeblocks will require these weird splits.
	//
	// recurseReplace(el, themeName);

	const split = el.innerHTML.split(/\<code/g);

	let inner = '';

	for (let i = 0; i < split.length; i++) {
		if (i % 2 == 0) {
			inner += split[i].replace(PREFIX, (match) => {
				return `<span class="${CSS_COLOR_PREFIX}${themeName}-${match.slice(3, match.length - 1)}">`;
			}).replace(SUFFIX, "</span>")
			continue;
		}

		inner += "<code"
		const innerSplit = split[i].split("</code>")

		for (let j = 0; j < innerSplit.length; j++) {
			if (j % 2 == 0) {
				inner += innerSplit[j];
				continue;
			}
			inner += "</code>" + innerSplit[i].replace(PREFIX, (match) => {
				return `<span class="${CSS_COLOR_PREFIX}${themeName}-${match.slice(3, match.length - 1)}">`;
			}).replace(SUFFIX, "</span>")

		}

	}

	const parser = new DOMParser();
	const newNode = parser.parseFromString(inner, "text/html").body;

	el.setChildrenInPlace([ newNode ])

	// el.innerHTML = inner;
}

/**
 * DEPRECATED - leaving here because it might be needed at some point
 *
 * @param {Node} node - [TODO:description]
 * @param {string} themeName - [TODO:description]
 * @returns {[TODO:type]} [TODO:description]
 */
function recurseReplace(node: Node, themeName: string) {

	if (node.nodeName == 'CODE') {
		return;
	}

	if (node.nodeType == Node.TEXT_NODE) {
		// console.log(node.textContent);
		let text = node.nodeValue;

		if (text == undefined) {
			return;
		}

		const colors = text.match(PREFIX)?.map(value => value.slice(3, value.length - 1));
		let colorCount = 0;

		if (colors == undefined || colors.length == 0) {
			return;
		}

		let splitOnLeft = text.split(PREFIX);

		// create document fragment to hold values
		const fragment = document.createDocumentFragment().createDiv();

		for (let i = 0; i < splitOnLeft.length; i++) {
			const textElement = splitOnLeft[i];

			if (textElement == '') {
				continue;
			}

			let splitOnRight = textElement.split(SUFFIX);

			for (let j = 0; j < splitOnRight.length; j++) {
				const element = splitOnRight[j];

				if (j % 2 == 0) {
					const span = document.createSpan();
					span.addClass(`${CSS_COLOR_PREFIX}${themeName}-${colors[colorCount]}`)
					fragment.appendChild(span)
					continue;
				}

				fragment.appendChild(document.createTextNode(element))
			}

		}

		// text = text.replace(PREFIX, (match) => {
		// 	return `<span class="${CSS_COLOR_PREFIX}${themeName}-${match.slice(3, match.length - 1)}">`;
		// }).replace(SUFFIX, "</span>")

		// node.nodeValue = text;
		// console.log(node.nodeValue);
	}

	node.childNodes.forEach(child => {
		recurseReplace(child, themeName);
	});
}

/**
 * DEPRECATED - leaving here because it micht be needed at some point.
 *
 * @param {Tree} tree - [TODO:description]
 * @param {string} text - [TODO:description]
 * @returns {string} [TODO:description]
 */
function colorTextWithTree(tree: Tree, text: string): string {
	// need to parse similar to view plugin

	const stack: string[] = [];
	const out: string = text;

	tree.iterate({
		enter(node) {
			// console.log(node.name)

			switch (node.type.name) {
				case "REnd":
					stack.pop();
					return true;

				case "RMarker":
					return true;

				case "TcLeft":
					return true;

				case "Color":
					// console.log('color')
					let color = text.slice(node.from, node.to);
					stack.push(color);
					return true;

				case "Text":
					return false;

				case "Expression":
					return true;

				default:
					// console.log('default')
					break;
			}

		},
	})

	return ''
}
