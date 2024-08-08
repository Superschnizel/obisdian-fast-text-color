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

	const emergencyCopy = el.cloneNode(true);

	try {
		rebuildNode(el, themeName);
	} catch (e) {
		console.error(`fatal in rebuildNode: ${e}`)
		// readd from emergency Copy. should be removed as soon as node rebuilding is stable.
		el.childNodes.forEach(c => {
			c.parentNode?.removeChild(c);
		})

		emergencyCopy.childNodes.forEach(c => {
			el.appendChild(c);
		})
	}
	return;
}


/**
 * Rebuilds the Node Tree and adds color nodes where necessary.
 * This is done to make sure interactive functionality is not removed from nodes.
 *
 * @param {Node} node - the current node
 * @param {string} themeName - the name of the current theme. needed to ensure proper colors.
 * @param {number} [level] - the current recursion level.
 * @param {Node[]} [nodeStack] - a stack to keep track of added color nodes.
 * @returns {Node} the rebuilt node.
 */
function rebuildNode(node: Node, themeName: string, level: number = 0, nodeStack: Node[] = []): Node {
	if (node.nodeName == 'CODE') {
		return node;
	}

	if (level > 1000) {
		console.error("fatal: reached depth 1000 in recursion");

	}

	// keep track of last length of live nodeList to handle items moved out of list.
	let lastLength = node.childNodes.length;

	for (let i = 0; i < node.childNodes.length; i++) {

		lastLength = node.childNodes.length;


		let childNode: Node = node.childNodes.item(i);


		const text = childNode.nodeValue;

		// the last item on the stack should always be the current parent.
		if ((nodeStack.last() != undefined) && (nodeStack.last() != childNode) && !(childNode.compareDocumentPosition(nodeStack.last()!) & Node.DOCUMENT_POSITION_CONTAINS)) {
			console.log(`setting new parent for ${childNode.nodeName}`);

			childNode.parentNode?.removeChild(childNode);
			nodeStack.last()?.appendChild(childNode);

			// deal with elements moved outside of list.
			if (lastLength > node.childNodes.length) {
				i -= lastLength - node.childNodes.length;
			}
		}

		// console.log(`node: ${childNode.nodeName}, level: ${level}`);
		if (childNode.nodeType != Node.TEXT_NODE) {
			// if childnode is not textnode, handle recursively.
			childNode = rebuildNode(childNode, themeName, level + 1, nodeStack);

			// nodeStack.last()?.appendChild(rebuildNode(childNode, themeName, level + 1));
			continue;
		}

		// console.log(`node: ${childNode.nodeName}\n  text: ${text}\n  index: ${i}\n  childNode.length: ${node.childNodes.length}\n  lastLength: ${lastLength}`);

		if (text == null || text == "") {
			continue;
		}

		// get the position of the next prefix and suffix.
		let prefix = GetFirstMatch(text, PREFIX);
		let suffix = GetFirstMatch(text, SUFFIX);

		if (prefix == null && suffix == null) {
			// no matches;
			continue;
		}

		let nextPrefixPosition = prefix != null ? prefix.index : Number.POSITIVE_INFINITY;
		let nextSuffixPosition = suffix != null ? suffix.index : Number.POSITIVE_INFINITY;

		if (nextPrefixPosition == nextSuffixPosition) {
			// should never be the case but idk.
			console.error("fatal: nextPrefixPosition and nextSuffixPosition are the same but not infinity!!: " + `${nextPrefixPosition}`);

			return node;
		}

		if (nextPrefixPosition < nextSuffixPosition) {
			// next is prefix
			prefix = prefix!;

			let textBeforeDelim = text.slice(0, nextPrefixPosition);
			let textAfterDelim = text.slice(prefix.end);
			let prefixContent = prefix.value;
			let color = prefixContent.slice(3, prefixContent.length - 1);

			// console.log(`handling prefix:\nprevText: ${textBeforeDelim}\nnextText: ${textAfterDelim}`)

			// create the color element
			let colorSpan = document.createElement("span");
			colorSpan.addClass(`${CSS_COLOR_PREFIX}${themeName}-${color}`);

			// set text in last node and create color node and insert it after the last node. 
			childNode.nodeValue = textBeforeDelim;
			childNode.parentNode?.insertAfter(colorSpan, childNode);

			// add the rest of the text afterwards.
			let newNode = document.createTextNode(textAfterDelim);
			colorSpan.appendChild(newNode);

			// set the colorSpan to be the new parent.
			nodeStack.push(colorSpan);

			continue;
		}
		// next is suffix;

		let textBeforeDelim = text.slice(0, nextSuffixPosition);
		let textAfterDelim = text.slice(suffix!.end);

		// console.log(`handling suffix:\nprevText: ${textBeforeDelim}\nnextText: ${textAfterDelim}`);

		childNode.nodeValue = textBeforeDelim;

		let prevNode = nodeStack.pop()!;

		let newNode = document.createTextNode(textAfterDelim);
		prevNode.parentNode?.insertAfter(newNode, prevNode);

		continue;

	}
	return node;
}

/**
 * Print out the Dom Structure. Used for debugging. AI generated.
 * (should probably be moved to a helperclass)
 *
 * @param {Node} node - the current node
 * @param {number} [depth] - the depth of the recursion
 * @returns {string} the pretty printed dom Structure
 */
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

/**
 * get a list of all matches for a regex in a given string
 *
 * @param {string} text - the text to be matched
 * @param {RegExp} regex - regex used for matching. State of regex is not changed.
 * @returns {RegExMatch[]} The list of all matches in the given string.
 */
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
 * get the first match for a regex and a given text.
 *
 * @param {string} text - the text to be matched
 * @param {RegExp} regex - the regex to be used. state of regex is not changed.
 * @returns {RegExMatch | null} the first match or null
 */
function GetFirstMatch(text: string, regex: RegExp): RegExMatch | null {
	const regexCopy = new RegExp(regex.source, 'g');
	const matches: RegExMatch[] = [];

	let m = regexCopy.exec(text);

	if (m !== null) {
		return {
			index: m.index,
			value: m[0],
			end: m.index + m[0].length
		};
	}

	return null;
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
