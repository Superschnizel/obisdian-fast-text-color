# Fast Text Color

This Obsidian plugin allows you to create beautifully colored and still interactive notes with a custom coloring syntax. 

## Features

- Custom coloring syntax that integrates well with existing obsidian syntax.
- Keyboard-centric coloring menu.
- Wide variety of formatting options through use of CSS classes
- No use of HTML tags.

## Usage

Colored text uses the following syntax:

```
~={id} This text is colored according to the id=~
```

The id maps to color and formatting options, wich can be changed in the settings.

The formatting options include:

- Text color
- Italic
- Bold
- Underline, overline, throughline
- Capital letters, small capitals

### Coloring Menu

Calling the `change text color` command opens the coloring menu, which allows you to choose the color of the selected text or inserts a colored section if no text is selected.

You can select a color by either by clicking on a button or by using the assigned keybind. Keybinds can be set in the settings.

## Known issues

These issues mainly arrise from the different techniques needed for Live Preview and Reading Mode and will be fixed in the future.

- **Reading Mode**.
	- an unopened closing delimiter `+-` will lead to problems in reading mode.

## Planned Features:

- Selectable color themes
- More ways to apply color
	- context menu
	- suggester

## How it works

This plugin works by using a custom parser, which allow the coloring to work very well
