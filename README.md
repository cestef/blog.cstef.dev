> [!warning]
> ### This repository has moved to Codeberg
>
> The project has moved to: **[codeberg.org/cstef/blog](https://codeberg.org/cstef/blog)**
---
<p align="center">
    <img src="./assets/dark-gruvbox.png#gh-dark-mode-only" alt="blog.cstef.dev" width="100%">
    <img src="./assets/light-gruvbox.png#gh-light-mode-only" alt="blog.cstef.dev" width="100%">
</p>

A collection of notes, thoughts, and ideas, or whatever I feel like writing about. 

<p align="center">
    <b><a href="https://blog.cstef.dev">Visit the blog</a></b>
</p>

## Making this blog yours

This blog is built using a fork of [zola](https://www.getzola.org/), a static site generator written in Rust. You can read about the changes I made in the [README](https://github.com/cestef/zola).

### Getting up and running

1. Clone the repository

```bash
git clone https://codeberg.org/cstef/blog.git
cd blog
```

2. Install `zola`

#### Homebrew

```bash
brew install cestef/tap/zola
```

#### Cargo (manual)

```bash
git clone https://github.com/cestef/zola
cd zola
cargo install --path .
```

3. Install `node` dependencies

```bash
pnpm install
```

4. Start the development server

```bash
pnpm dev
```

This will start both `zola` and `tailwindcss` in watch mode.

### Writing content

This blog uses an extended version of the `markdown` syntax.

#### Frontmatter

Front matter is a block of TOML at the beginning of a file that specifies metadata (title, date, etc.) about the file. It is delimited by `+++`.

```markdown
+++
title = "My awesome post"
description = "A short description of the post"
date = 2021-08-01

[taxonomies]
tags = ["rust", "zola"]
+++
```

#### Math (SSR)

Currently, only rendering via [`typst`](https://github.com/typst/typst) is supported. To render math, use the following syntax:

##### Display math

```markdown
$$
lim_(x->oo) (1 + 1/x)^x
$$
```

##### Inline math

```markdown
$lim_(x->oo) (1 + 1/x)^x$
```

##### Raw math

Raw math is rendered using `typst` but without any additional formatting. See it as just rendering a file.

~~~markdown
```typ
#set text(20pt)
#align(center + horizon)[
    $ lim_(x->oo) (1 + 1/x)^x $
]
```
~~~

#### Diagrams (SSR)

Diagrams are rendered using [`pikchr`](https://pikchr.org). To render a diagram, use the following syntax:

~~~markdown
```pikchr
box "Hello, World!"
```
~~~

