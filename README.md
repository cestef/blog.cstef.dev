<p align="center">
    <img src="./assets/dark-gruvbox.png#gh-dark-mode-only" alt="blog.cstef.dev" width="100%">
    <img src="./assets/light-gruvbox.png#gh-light-mode-only" alt="blog.cstef.dev" width="100%">
</p>

My personal digital garden 🌱

A collection of notes, thoughts, and ideas, or whatever I feel like writing about. 

<p align="center">
    <b><a href="https://blog.cstef.dev">Visit the blog</a></b>
</p>

## Making this blog yours

This blog is built using the [astro](https://astro.build) framework. The content is written in an opinionated extended markdown format, which is then compiled into a static site.

### Getting started

1. Clone this repository

```bash
git clone https://github.com/cestef/blog.cstef.dev.git
```

2. Install the dependencies

```bash
pnpm install
```

3. Start the development server

```bash
pnpm dev
```

4. Open your browser and navigate to [`http://localhost:4321`](http://localhost:4321)

### Writing content

The posts are located in the `src/content/blog` directory. Each post can either be a single markdown file or a directory containing an `index.md` file and any additional assets (images, code snippets, etc).

#### Frontmatter

Each post should start with a frontmatter block that contains metadata about the post. Here's an example:

```markdown
---
title: Hello, World!
description: This is a description of the post
date: 2024-11-29
tags: [hello, world]
growth: seed
---

# Hello, World!
```

- `title`: The title of the post
- `description`: A short description of the post
- `date`: The date the post was published/updated
- `tags`: An array of tags for the post, used for categorization
- `growth`: The growth stage of the post. This can be one of: `seed`, `sapling`, `tree`

#### Math

This blog uses the amazing [typst](typst.dev) typesetting library to render math equations and much more. To render math equations, you can use the `$` or `$$` delimiters:

```markdown
This is an inline math equation: ${ x in RR | x "is natural" and x < 10 }$

And this is a block math equation:

$$
lim_(x->oo) 1/x = 0
$$
```

Rendering raw typst content is also possible by embedding it in a `typst` code block:

~~~markdown
```typst
x in RR | x "is natural" and x < 10
```
~~~

> [!TIP]
> You can include external typst files into your markdown using the `@include` directive. For example, to include the `figures/diagram.typ` file, you can use the following directive:
> `@include figures/diagram.typ`

#### Diagrams

Diagrams like flowcharts, sequence diagrams, and more are rendered using the [pikchr](https://pikchr.org/home) library. They can be included in your markdown using a `pikchr` code block:

~~~markdown
```pikchr
box "Hello, World!"
```
~~~

