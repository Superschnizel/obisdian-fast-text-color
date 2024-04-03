# Fast Text Color

This Obsidian plugin allows you to create beautifully colored and still interactive notes with a custom coloring syntax. 

<img src="https://github.com/Superschnizel/obisdian-fast-text-color/assets/47162464/3330aacc-78b8-4383-b8de-5672e84ad0fd" width="60%">

> This plugin is still in development and may change significantly before a 1.0.0 release. It is currently only available for Beta testing.

## Features

- Custom coloring syntax that integrates well with existing obsidian syntax
- Keyboard-centric coloring menu
- Wide variety of formatting options through the use of CSS classes
- No use of HTML tags

<img src="https://github.com/Superschnizel/obisdian-fast-text-color/assets/47162464/c7974c32-1b92-4a9d-a539-13a2ec38ed1d" width="60%">

## Usage

Colored text uses the following syntax:

```
~={id} This text is colored according to the id=~
```

The id maps to color and formatting options wich can be changed in the settings.

The formatting options include:

- Text color
- Italic
- Bold
- Underline, overline, throughline
- Capital letters, small capitals

These options are handled with CSS classes, wich means that any changes apply retroactively to all sections marked with the respective id.

### Coloring Menu

Calling the `change text color` command opens the coloring menu, which allows you to choose the color of the selected text or inserts a colored section if no text is selected.

You can select a color by either by clicking on a button or by using the assigned keybind. Keybinds can be set in the settings.

<p float="left">
	<img src="https://github.com/Superschnizel/obisdian-fast-text-color/assets/47162464/6ff82ee6-e096-4095-9cd3-03839d15fe18" width="49%">
	<img src="https://github.com/Superschnizel/obisdian-fast-text-color/assets/47162464/e6c02305-fc4c-4325-be4b-41dc2f1155dc" width="49%">
</p>

## Known issues

These issues mainly arrise from the different techniques needed for Live Preview and Reading Mode and will be fixed in the future.

- **Reading Mode**.
	- an unopened closing delimiter `+-` will lead to problems in reading mode.

## Planned Features:

- Selectable color themes
- More ways to apply color
	- context menu
	- suggester
 - Automatically Color by Keyword
 - More (Custom) Css elements

## How it works

This plugin works by using a custom parser, which allow the coloring to work very well
