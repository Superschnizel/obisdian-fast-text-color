import { parser } from './textColorLanguageParser';
import { LRLanguage, LanguageSupport } from '@codemirror/language';

export const textColorLanguage = LRLanguage.define({
	name: 'textColorLanguage',
	parser: parser.configure({}),
});

export function criticmarkup() {
	return new LanguageSupport(textColorLanguage);
}
