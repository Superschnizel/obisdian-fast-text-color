import {Facet} from '@codemirror/state'
import { DEFAULT_SETTINGS, FastTextColorPluginSettings } from "./FastTextColorSettings";

export const settingsFacet = Facet.define<FastTextColorPluginSettings, FastTextColorPluginSettings>(
	{
		combine: inputs => {
			console.log(inputs);
			if (inputs.length <= 0) {
				return DEFAULT_SETTINGS;
			}

			return inputs[inputs.length - 1];

		}
	}
);
