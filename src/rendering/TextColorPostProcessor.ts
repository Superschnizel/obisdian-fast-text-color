import { MarkdownPostProcessor } from 'obsidian'
import { textColorLanguage } from './language/textColorLanguage';
import {type ChangedRange, type Tree, TreeFragment} from '@lezer/common';
import { CSS_COLOR_PREFIX } from 'src/FastTextColorSettings';
import { PREFIX, SUFFIX } from 'src/utils/regularExpressions';

export const textColorPostProcessor : MarkdownPostProcessor = (el, ctx) => {
	console.log('postProcessing');
	// console.log(el);
	// console.log(el);
	console.log(el.innerHTML);


	let text = el.innerHTML;

	if (text == null) {
		return;
	}

	// very simple version.. this does not like having +- somewhere in the text
	// TODO
	text = text.replace(PREFIX, (match) => {
		return `<span class="${CSS_COLOR_PREFIX}${match.slice(3, match.length - 1)}">`;
	}).replace(SUFFIX, "</span>")
	
	// let tree = textColorLanguage.parser.parse(text);
	
	el.innerHTML = text;
}

function colorTextWithTree(tree : Tree, text: string) : string {
	// need to parse similar to view plugin
	
	const stack : string [] = [];
	const out : string = text;

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
