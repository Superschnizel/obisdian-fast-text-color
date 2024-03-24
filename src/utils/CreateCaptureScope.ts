import { Editor, Scope, EditorPosition, App } from "obsidian";

/**
 * Creates a scope that will enable Tab to exit the color mode by searching for the end of the colored section.
 * @param editor 
 * @param app 
 * @param pos initial position from wich to search
 * @param suffix the suffix to search for
 * @returns 
 */
export function CreateCaptureScope(editor : Editor, app : App, pos : EditorPosition, suffix : string) : Scope {
    let scope = new Scope();
    scope.register([], "Tab", (event) => {
        if (event.isComposing) {
            return true;
        }
        
        // scan next 100 characters for suffix.
        let goalPos : EditorPosition = {
            line: pos.line,
            ch: pos.ch + 100
        }
        let range = editor.getRange(pos, goalPos);

        let i = range.indexOf(suffix);
        if (i < 0) {
            app.keymap.popScope(scope);
            return true;
        }
        
        goalPos.ch = pos.ch + i + suffix.length;
        editor.setCursor(goalPos);

        app.keymap.popScope(scope);
        return false;
    });

    let exit = (event : KeyboardEvent) => {
        if (event.isComposing) {
            return true;
        }
        app.keymap.popScope(scope);
        return true;
    }

    scope.register([], "Escape", exit);
    scope.register([], "Enter", exit);
    scope.register(['Ctrl'], "Z", exit);

    return scope;
}
