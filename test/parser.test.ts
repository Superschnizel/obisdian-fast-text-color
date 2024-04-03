import fs from 'fs';
import path from 'path';
import { parser } from "../src/rendering/language/textColorLanguageParser"

// This test script was generated with Chat-GPT

console.log('Starting Parser Tests...');
const testCasesDir = path.join(__dirname, 'test-cases');

describe('Parser Tests', () => {
	const testCasesDir = path.join(__dirname, 'test-cases');

	// Test case for each file in the test-cases directory
	fs.readdirSync(testCasesDir).forEach(file => {
		it(`should parse ${file} correctly`, () => {
			const filePath = path.join(testCasesDir, file);
			const data = fs.readFileSync(filePath, 'utf8');

			// Parse file contents using parser.parse()
			try {
				const parsedData = parser.parse(data);
				let tree = '';

				parsedData.iterate({
					enter(node) {
						tree += node.name + '\n';
					},
				})
				console.log(tree);
				// console.log(`Parsed data from ${file}:`, parsedData);
			} catch (parseError) {
				// Handle parsing errors
				throw new Error(`Error parsing file ${file}: ${parseError.message}`);
			}
		});
	});
});
