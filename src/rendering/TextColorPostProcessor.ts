import { MarkdownPostProcessorContext } from 'obsidian'
import { Tree } from "@lezer/common";
import { CSS_COLOR_PREFIX, FastTextColorPluginSettings, getCurrentTheme } from 'src/FastTextColorSettings';
import { PREFIX, SUFFIX, RegExMatch } from 'src/utils/regularExpressions';
import { match } from 'assert';
import { Console } from 'console';

export const textColorPostProcessor = (el: HTMLElement, context: MarkdownPostProcessorContext, settings: FastTextColorPluginSettings) => {

	if (!el.innerHTML.match(PREFIX)) {
		return;
	}

	// get theme name from frontmatter or from settings
	let themeName = context.frontmatter ? context.frontmatter["ftcTheme"] : null;
	themeName = themeName ? themeName : getCurrentTheme(settings).name;

	// This is a hacky way of doing this, but every other possibility seemed incredibly convoluted.
	// For now to handle the codeblocks will require these weird splits.
	//
	// I tried doing this another way (see version 1.0.5) but that caused some very weird issues with themes and css.

	rebuildNode(el, themeName);
	return;

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

	el.innerHTML = inner;

	return;
}


/**
 * Rebuilds the Node Tree and adds color nodes where necessary.
 * This is done to make sure interactive functionality is not removed from nodes.
 *
 * @param {Node} node - [TODO:description]
 * @returns {Node} [TODO:description]
 */
function rebuildNode(node: Node, themeName: string): Node {
	if (node.nodeName == 'CODE') {
		return node;
	}

	// if (!node.hasChildNodes()) {
	// 	console.log("no childs?");
	// 	
	// 	return node;
	// }

	// create a stack to manage state
	const nodeStack: Node[] = [];

	// get the children 
	// const newNode = node.cloneNode(false);
	const newNode = document.createDocumentFragment().createDiv();

	// remove all copied children
	// while (node.firstChild) {
	// 	node.removeChild(node.firstChild)
	// }
	
	// let children : Node[] = [];
	// node.childNodes.forEach(n => {
	// 	children.push(n.cloneNode(true));
	// })

	nodeStack.push(newNode);

	let children = node.childNodes;
	children.forEach((childNode : Node) => {
		console.log(`node: ${childNode.nodeType}`);

		console.log(node.textContent);
		// 
		//
		// if (childNode.nodeType != Node.TEXT_NODE) {
		// 	// if childnode is not textnode, handle recursively.
		// 	console.log("is not textNode");
		// 	
		// 	nodeStack.last()?.appendChild(rebuildNode(childNode, themeName))
		// 	return;
		// }
		//
		// console.log(childNode.textContent);
		//
		// const text = childNode.textContent;
		//
		// if (text == null) {
		// 	return;
		// }
		//
		// // node has one or more opening delimiters in it.
		//
		// // get the list of prefixes and suffixes in the text node.
		// let prefixes = GetAllMatches(text, PREFIX).reverse();
		// let suffixes = GetAllMatches(text, SUFFIX).reverse();
		// let lastpos = 0;
		//
		// while ((prefixes.length > 0) || (suffixes.length > 0)) {
		// 	let nextPrefixPosition = prefixes.last()?.index ?? Number.POSITIVE_INFINITY;
		// 	let nextSuffixPosition = suffixes.last()?.index ?? Number.POSITIVE_INFINITY;
		//
		// 	if (nextPrefixPosition == nextSuffixPosition) {
		// 		// should never be the case but idk.
		// 		console.log("nextPre and nextSuf are the same!!: " + `${nextPrefixPosition}`);
		//
		// 		break;
		// 	}
		//
		// 	if (nextPrefixPosition < nextSuffixPosition) {
		// 		// next is prefix
		// 		let prevText = text.slice(lastpos, nextPrefixPosition);
		// 		let prefix = prefixes.last()!.value;
		// 		let color = prefix.slice(3, prefix.length - 1);
		//
		// 		console.log(`handling prefix:\nprevText: ${prevText}`)
		//
		// 		let colorSpan = nodeStack.last()!.createSpan();
		// 		colorSpan.addClass(`${CSS_COLOR_PREFIX}${themeName}-${color}`);
		//
		// 		// append Text node and then append new color node
		// 		nodeStack.last()?.appendChild(document.createTextNode(prevText));
		// 		nodeStack.last()?.appendChild(colorSpan);
		// 		nodeStack.push(colorSpan);
		//
		// 		lastpos = prefixes.last()!.end;
		//
		// 		// remove prefix from match.
		// 		prefixes.pop();
		//
		// 		continue;
		// 	}
		//
		// 	// next is suffix;
		// 	let prevText = text.slice(lastpos, nextSuffixPosition);
		// 	nodeStack.last()?.appendChild(document.createTextNode(prevText));
		//
		// 	console.log(`handling suffix:\nprevText: ${prevText}`)
		//
		// 	lastpos = suffixes.last()!.end;
		//
		// 	nodeStack.pop();
		// 	suffixes.pop();
		// }
		//
		// if (lastpos <= text.length) {
		// 	let prevText = text.slice(lastpos);
		// 	nodeStack.last()?.appendChild(document.createTextNode(prevText));
		// }
		//
		// console.log("finished node rebuild");

	});

	// // remove all childs from original node:
	// while (node.firstChild) {
	// 	node.removeChild(node.firstChild);
	// }
	//
	// // append new node structure.
	// newNode.childNodes.forEach(child => {
	// 	node.appendChild(child);
	// });
	//
	// newNode.empty();

	return node;

}

function GetAllMatches(text: string, regex: RegExp): RegExMatch[] {
	const regexCopy = new RegExp(regex.source, '');
	const matches: RegExMatch[] = [];

	let m = regexCopy.exec(text);

	let startIndex = 0;
	while (m != null) {
		matches.push({
			index: m.index,
			value: m[0],
			end: m.index + m[0].length
		}); 

		startIndex = m.index + m[0].length;
		m = regexCopy.exec(text.slice(startIndex))
	}

	return matches;
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

		// get Color
		const colors = text.match(PREFIX)?.map(value => value.slice(3, value.length - 1));

		let colorCount = 0;

		if (colors == undefined || colors.length == 0) {
			return;
		}

		let splitOnPrefix = text.split(PREFIX);

		// create document fragment to hold values
		const fragment = document.createDocumentFragment();

		for (let i = 0; i < splitOnPrefix.length; i++) {
			const textElement = splitOnPrefix[i];

			if (textElement == '') {
				continue;
			}

			let splitOnSuffix = textElement.split(SUFFIX);

			for (let j = 0; j < splitOnSuffix.length; j++) {
				const element = splitOnSuffix[j];

				if (j % 2 == 0) {
					// is colored text.
					const span = document.createSpan();

					fragment.appendChild(span)
					continue;
				}

				fragment.appendChild(document.createTextNode(element))
			}
		}

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
