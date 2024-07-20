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
	console.log(prettyPrintDOMStructure(el));

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
function rebuildNode(node: Node, themeName: string, level: number = 0, nodeStack: Node[] = []): Node {
	if (node.nodeName == 'CODE') {
		return node;
	}

	if (level > 1000) {
		console.log("reached depth 1000 in recursion");

	}

	// if (!node.textContent?.match(PREFIX) && !node.textContent?.match(SUFFIX)) {
	// 	return node;
	// }

	// if (!node.hasChildNodes()) {
	// 	console.log("no childs?");
	// 	
	// 	return node;
	// }

	// create a stack to manage state
	// const nodeStack: Node[] = [];

	// get the children 
	// const newNode = node.cloneNode(false);
	// const newNode = document.createDocumentFragment().createDiv();

	// remove all copied children
	// while (node.firstChild) {
	// 	node.removeChild(node.firstChild)
	// }

	// let children : Node[] = [];
	// node.childNodes.forEach(n => {
	// 	children.push(n.cloneNode(true));
	// })

	nodeStack.push(node);

	let children = node.childNodes;
	node.childNodes.forEach((childNode: Node) => {

		if (childNode == nodeStack.last()) {
			// can happen because of appending
			return;
		}

		const text = childNode.nodeValue;
		console.log(`node: ${childNode.nodeName} ==> ${text}`);
		// console.log(childNode.compareDocumentPosition(nodeStack.last()!));

		// the last item on the stack should always be the current parent.
		if (!(childNode.compareDocumentPosition(nodeStack.last()!) & Node.DOCUMENT_POSITION_CONTAINS)) {
			console.log("setting new parent");

			childNode.parentNode?.removeChild(childNode);
			nodeStack.last()?.appendChild(childNode);
		}

		// console.log(`node: ${childNode.nodeName}, level: ${level}`);
		if (childNode.nodeType != Node.TEXT_NODE) {
			// if childnode is not textnode, handle recursively.
			childNode = rebuildNode(childNode, themeName, level + 1, nodeStack);
			// console.log(`rbuilding and appending ${childNode.nodeName} to ${nodeStack.last()?.nodeName}`);

			// nodeStack.last()?.appendChild(rebuildNode(childNode, themeName, level + 1));
			return;
		}

		if (text == null || text == "") {
			return;
		}

		// node has one or more opening delimiters in it.

		// get the list of prefixes and suffixes in the text node.
		let prefixes = GetAllMatches(text, PREFIX).reverse();
		let suffixes = GetAllMatches(text, SUFFIX).reverse();
		let lastpos = 0;

		// console.log(`prefixes: ${prefixes.reduce((prev, next) => prev + `, ${next.index}`, "")}`);
		// console.log(`suffixes: ${suffixes.reduce((prev, next) => prev + `, ${next.index}`, "")}`);

		if ((prefixes.length <= 0) && (suffixes.length <= 0)) {
			// exit out if no matches found.
			return;
		}

		let count = 0;

		let lastInsertedNode = childNode;

		while ((prefixes.length > 0) || (suffixes.length > 0)) {
			let nextPrefixPosition = prefixes.last()?.index ?? Number.POSITIVE_INFINITY;
			let nextSuffixPosition = suffixes.last()?.index ?? Number.POSITIVE_INFINITY;

			// if (nodeStack.last()! != childNode.parentNode) {
			// 	console.log("setting new parent");
			//
			// 	childNode.parentNode?.removeChild(childNode);
			// 	nodeStack.last()?.appendChild(childNode);
			// }

			count++;
			if (count > 1000) {
				console.log(`count was too large, next: pre=${nextPrefixPosition}, suf=${nextSuffixPosition}`);
			}

			if (nextPrefixPosition == nextSuffixPosition) {
				// should never be the case but idk.
				console.log("nextPre and nextSuf are the same!!: " + `${nextPrefixPosition}`);

				return;
			}


			if (nextPrefixPosition < nextSuffixPosition) {
				// next is prefix
				let textBeforeDelim = text.slice(lastpos, nextPrefixPosition);
				let textAfterDelim = text.slice(prefixes.last()!.end);
				let prefix = prefixes.last()!.value;
				let color = prefix.slice(3, prefix.length - 1);

				console.log(`handling prefix:\nprevText: ${textBeforeDelim}`)

				// nodeStack.last()?.insertAfter(document.createTextNode(prevText), referenceNode);

				// var newPrevNode = document.createTextNode(prevText);
				// var reference = childNode.parentNode == nodeStack.last()! ? childNode : nodeStack.last()!.lastChild;
				// nodeStack.last()?.insertAfter(newPrevNode, reference);

				// nodeStack.last()?.replaceChild(document.createTextNode(prevText), childNode);

				// if (nodeStack.last()! != childNode.parentNode) {
				// 	childNode.parentNode?.removeChild(childNode);
				// 	nodeStack.last()?.appendChild(childNode);
				// }

				let colorSpan = document.createElement("span");
				colorSpan.addClass(`${CSS_COLOR_PREFIX}${themeName}-${color}`);

				// set text in last node and create color node and insert it after the last node. 
				lastInsertedNode.nodeValue = textBeforeDelim;
				nodeStack.last()?.insertAfter(colorSpan, lastInsertedNode);

				// add an empty text node to the span and set is as te lastInsertedNode
				// this will be filled in the next iteration.
				let newNode = document.createTextNode("");
				colorSpan.appendChild(newNode);

				lastInsertedNode = newNode;

				// set the colorSpan to be the new parent.
				nodeStack.push(colorSpan);

				lastpos = prefixes.last()!.end;

				// childNode.nodeValue = textBeforeDelim;

				// colorSpan.appendChild(document.createTextNode(textAfterDelim));

				// remove prefix from match.
				prefixes.pop();

				continue;
			}
			// next is suffix;

			let textBeforeDelim = text.slice(lastpos, nextSuffixPosition);
			// let textAfterDelim = text.slice(suffixes.last()!.end);

			lastInsertedNode.nodeValue = textBeforeDelim;

			let prevNode = nodeStack.pop()!;

			let newNode = document.createTextNode("");
			nodeStack.last()?.insertAfter(newNode, prevNode);
			lastInsertedNode = newNode;
			// nodeStack.last()?.insertAfter(document.createTextNode(textAfterDelim), prevNode);
			// let prevText = text.slice(lastpos, nextSuffixPosition);
			// // childNode.parentNode?.removeChild(childNode);
			// nodeStack.last()?.appendChild(document.createTextNode(prevText));

			// console.log(`handling suffix:`)

			lastpos = suffixes.last()!.end;
			//

			suffixes.pop();

			continue;
		}

		// remove original child node
		// childNode.parentNode?.removeChild(childNode);

		if (lastpos <= text.length) {
			let leftOverText = text.slice(lastpos);
			lastInsertedNode.nodeValue = leftOverText;
		}
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

	nodeStack.pop();
	return node;

}

function prettyPrintDOMStructure(node: Node, depth: number = 0): string {
	const indent = '  '.repeat(depth);
	let output = '';

	switch (node.nodeType) {
		case Node.ELEMENT_NODE:
			const element = node as Element;
			output += `${indent}${element.tagName.toLowerCase()}`;

			if (element.id) {
				output += `#${element.id}`;
			}

			if (element.className && typeof element.className === 'string') {
				output += `.${element.className.split(' ').join('.')}`;
			}

			output += '\n';

			Array.from(element.attributes).forEach(attr => {
				if (attr.name !== 'id' && attr.name !== 'class') {
					output += `${indent}  ${attr.name}="${attr.value}"\n`;
				}
			});

			element.childNodes.forEach(childNode => {
				output += prettyPrintDOMStructure(childNode, depth + 1);
			});
			break;

		case Node.TEXT_NODE:
			const text = node.textContent?.trim();
			if (text) {
				output += `${indent}"${text}"\n`;
			}
			break;
	}

	return output;
}

function GetAllMatches(text: string, regex: RegExp): RegExMatch[] {
	// so in the end i guess it does have to be global.
	// Regex being statefull is just so annoying...
	// im starting to get why some people hate on OOP
	const regexCopy = new RegExp(regex.source, 'g');
	const matches: RegExMatch[] = [];

	// let m = regexCopy.exec(text);
	let m;

	while ((m = regexCopy.exec(text)) !== null) {
		matches.push({
			index: m.index,
			value: m[0],
			end: m.index + m[0].length
		});
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
