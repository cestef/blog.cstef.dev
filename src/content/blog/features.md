---
title: Features
author: cstef
tags: []
---

`uses.ink` comes with a lot of features out of the box. No configuration needed. You push and we render.

## Overview <!-- toc -->

## Auto-Generated README

In case you don't have a `README.md` file at the root of the current directory, `uses.ink` will generate one for you. The README will contain a list of all the markdown files and directories in the current path. 

You can see an example of this at [`cestef.uses.ink/blog/posts`](https://cestef.uses.ink/blog/posts)

## Metadata

You can add metadata to your markdown files by adding a YAML front matter block at the top of the file. This block must be the first thing in the file and must take the form of a valid YAML object. The metadata block is separated from the rest of the content by a line of three dashes.

Here is an example of a metadata block:

```yaml
---
title: My Awesome Post
author: John Doe
date: 2021-01-01
---
```

The following properties can be set in the metadata block:

- `title`: The title of the post.
- `description`: A short description of the post. This is used as the meta description for the post.
- `author`: The author of the post.
- `date`: The date the post was published. This should be in the format `YYYY-MM-DD` or `YYYY-MM-DD,HH:MM:SS`.
- `layout`: The layout to use when rendering the post. This can be `post` or `gallery`.
- `hideTop`: Whether to hide the top navigation bar.
- `readingTime`: Set to `false` to hide the reading time.
- `nav`: An object containing the navigation links for the post:
```yaml
nav:
  Home: /
  Blog: /blog        
``` 
- `math`: The math rendering engine to use. This can be `typst` (default) or `katex`.
- `noHighlight`: Set to `true` to disable syntax highlighting in code blocks.
- `defaultCopy`: Whether to enable by default the copy button for code blocks. This can be `true` or `false` (default).

Most of these fields are automatically populated based on the git commit information or file content. You can override them by setting the corresponding property in the metadata block.

## Configuration files

in case you want to configure further the rendering of your markdown files, you can add a `uses.ink.json` file. This fille will override the default configuration for the current directory. This means you need to add a `uses.ink.json` file in each directory you want to configure.

Here is an example of a `uses.ink.json` file:

```json title="uses.ink.json" copy
{
    "hideTop": true,
    "readingTime": false,
    "math": "katex",
    "noHighlight": true,
    "layout": "gallery",
    "nav": {
        "Home": "/",
        "Blog": "/blog"
    },
    "defaultCopy": true
}
```

### Github user-wise configuration

You can also add a `uses.ink.json` file at your "special" repository to configure the rendering of your markdown files. This file will be used as the default configuration for all your repositories.

If not already done, create a repository with the same name as your Github username. For example, if your username is `cstef`, create a repository named `cstef`. Then, add a `uses.ink.json` file to this repository.

This configuration takes the same properties as the `uses.ink.json` file at the root of your repository, and can have the following properties in addition:

- `defaultRepo`: The default repository to use when none is specified. This needs to be the name of the repository (e.g., `uses.ink`).
- `defaultBranch`: The default branch/ref to use when none is specified. This is usually `main` or `master`.

## Math

Math is rendered by default using [typst](https://github.com/typst/typst)

```typ
$$
det(A) = sum_(k=1)^n (-1)^(k+1) a_1k det(A_1k) 
$$
```

$$
det(A) = sum_(k=1)^n (-1)^(k+1) a_1k det(A_1k)
$$

You may ask why we use `typst` instead of `LaTeX` ? I personally find `typst`'s syntax to be more markdown-ish and easier to use. If you don't like it, you can always use another engine by setting the `math` property in the metadata block:

```yaml
---
math: katex # for LaTeX rendering
---
```

## Callouts

You can add callouts by using the following syntax:

```markdown
> [!note]
> This is a note
```

> [!note]
> This is a note




<details>

<summary>
The following callouts are available:
</summary>

- `[!info]{:md}`
- `[!note]{:md}`
- `[!todo]{:md}`
- `[!abstract]{:md}` `[!summary]{:md}`  `[!tldr]{:md}`
- `[!tip]{:md}`  `[!hint]{:md}`  `[!important]{:md}`
- `[!success]{:md}`  `[!check]{:md}`  `[!done]{:md}`
- `[!question]{:md}`  `[!help]{:md}`  `[!faq]{:md}`
- `[!warning]{:md}`  `[!caution]{:md}`  `[!attention]{:md}`
- `[!failure]{:md}`  `[!fail]{:md}`  `[!missing]{:md}`
- `[!danger]{:md}`  `[!error]{:md}`
- `[!bug]{:md}`
- `[!example]{:md}`
- `[!quote]{:md}`  `[!cite]{:md}`

</details>

Callouts can also be foldable:

```markdown
> [!warning]- This is a note
> It can be folded
```

> [!warning]- This is a note
> It can be folded

## Code Blocks

Code blocks are rendered with syntax highlighting via [shiki](https://shiki.matsu.io/).
You can specify the language of the code block by adding the language name after the opening triple backticks.

~~~markdown
```python
print("Hello, World!")
```
~~~

```python
print("Hello, World!")
```

Inline code can be added by wrapping the code in backticks:

```markdown
What if `const a = 1;{:js}` ?
```

What if `const a = 1;{:js}` ?

### Line Numbers <!-- no-toc -->

You can add line numbers to code blocks by adding `showLineNumbers` to the code block:

~~~markdown
```python showLineNumbers
while True:
    print("Hello, World!")
```
~~~

```python showLineNumbers
while True:
    print("Hello, World!")
```

### Line Highlighting <!-- no-toc -->

You can highlight particular lines in a code block by specifying the line numbers after the language name:

~~~markdown
```python {1,3-5}
print("Hello, World!")
print("Hello, World!")
print("Hello, World!")
print("Hello, World!")
```
~~~

```python {1,3-5}
print("Hello, World!")
print("Hello, World!")
print("Hello, World!")
print("Hello, World!")
```

## Footnotes

Footnotes can be added using the following syntax:

```markdown
Here is a footnote reference,[^1] and another.[^longnote]

[^1]: Here is the footnote.
[^longnote]: Here's one with multiple blocks.

    Subsequent paragraphs are indented to show that they belong to the previous footnote.
```

Here is a footnote reference,[^1] and another.[^longnote]

[^1]: Here is the footnote.
[^longnote]: Here's one with multiple blocks.

    Subsequent paragraphs are indented to show that they belong to the previous footnote.

## Tables

Tables are rendered with GitHub Flavored Markdown:

```markdown
| Header 1 | Header 2 |
| -------- | -------- |
| Row 1    | Row 1    |
| Row 2    | Row 2    |
```

| Header 1 | Header 2 |
| -------- | -------- |
| Row 1    | Row 1    |
| Row 2    | Row 2    |

## Emojis

Shortcodes for emojis are supported:

```markdown
:smile:
```

:smile:

Emojis are rendered using [Twemoji](https://twemoji.twitter.com/).


## Tables of Contents

If a heading matching `/^.*<!--( ?)toc( ?)-->$/i{:regex}` is present in the markdown file, a table of contents will be generated.

```markdown
## Table of Contents <!-- toc -->
```

In case you want to remove particular headings from the table of contents, you can add a `<!-- no-toc -->` comment after the heading:

```markdown
## Heading 1 <!-- no-toc -->
## Heading 2
```

An example of a table of contents is shown at the [beginning of this document](#overview).

## Super- and Subscripts

You can add super- and subscripts using the `^` and `~` characters:

```markdown
H~2~O
21^st^ century
```

H~2~O
21^st^ century

## Diagrams

### Pikchr

We recommend using [Pikchr](https://pikchr.org/) as the primary diagramming tool for `uses.ink` due to its blazing speed and compatibility with markdown-like syntax.

~~~pikchr doNotRender
```pikchr
        arrow "source" "code"
LA:     box "lexical" "analyzer"
        arrow "tokens" above
P:      box "parser"
        arrow "intermediate" "code" wid 200%
Sem:    box "semantic" "checker"
        arrow
        arrow <-> up from top of LA
LC:     box "lexical" "corrector"
        arrow <-> up from top of P
Syn:    box "syntactic" "corrector"
        arrow up
DMP:    box "diagnostic" "message" "printer"
        arrow <-> right  from east of DMP
ST:     box "symbol" "table"
        arrow from LC.ne to DMP.sw
        arrow from Sem.nw to DMP.se
        arrow <-> from Sem.top to ST.bot
```
~~~

```pikchr
        arrow "source" "code"
LA:     box "lexical" "analyzer"
        arrow "tokens" above
P:      box "parser"
        arrow "intermediate" "code" wid 200%
Sem:    box "semantic" "checker"
        arrow
        arrow <-> up from top of LA
LC:     box "lexical" "corrector"
        arrow <-> up from top of P
Syn:    box "syntactic" "corrector"
        arrow up
DMP:    box "diagnostic" "message" "printer"
        arrow <-> right  from east of DMP
ST:     box "symbol" "table"
        arrow from LC.ne to DMP.sw
        arrow from Sem.nw to DMP.se
        arrow <-> from Sem.top to ST.bot
```

### D2

D2 diagrams are currently disabled due to performance/security reasons. I am working on a solution to make them available again.

<!-- However, if you need it, we also support [d2](https://d2lang.com/) diagrams. To add a d2 diagram, use the following syntax:

~~~d2 sketch doNotRender
```d2 sketch
server
# Declares a shape inside of another shape
server.process

# Can declare the container and child in same line
im a parent.im a child

# Since connections can also declare keys, this works too
apartment.Bedroom.Bathroom -> office.Spare Room.Bathroom: Portal
```
~~~

```d2 sketch
server
server.process
im a parent.im a child
apartment.Bedroom.Bathroom -> office.Spare Room.Bathroom: Portal
```

Since d2 is written in Go, it requires either a CLI or WebAssembly compilation. We currently use the CLI, as the WebAssembly version is slower (**~750ms** to render a diagram + **6MB** brotli-compressed `.wasm` file). You can find the source code for the WebAssembly version [here](https://github.com/uses-ink/d2wasm). -->

### Mermaid

We do not support Mermaid diagrams because they need to be either:

- Rendered on the client side, and we want to avoid as much as possible client-side rendering to keep the website fast.
- Rendered on the server side via a headless browser, which would require [playwright](https://playwright.dev/) or [puppeteer](https://pptr.dev/). This is in my opinion an overkill for a simple feature.
