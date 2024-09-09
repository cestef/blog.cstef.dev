---
title: Grow your own digital garden!
description: A digital garden is a place to cultivate your thoughts and ideas, and share it with others.
tags: [digital-garden, blog, tutorial]
date: 2024-09-09
growth: seedling
---

A digital garden is basically just a fancy name for a personal blog or wiki. It's a place to cultivate your thoughts and ideas, and share it with others. Aggregating your knowledge in one place can help you to see connections between different ideas, and to develop your thinking further. 

Even though I am myself a beginner in this field, I would still like to share my experience along with this template for those who are interested in creating their own.

## Starting out

As in a real garden, when you first start yours, it will be a blank canvas. You will need to plant some seeds, and then cultivate them over time. Your seeds can be anything: notes, ideas, projects, really whatever comes to your mind. They usually start out as **seedlings** :herb:, and will then grow slowly as you add content and connections to a **sapling** 🪴. When you feel like your ideas are mature enough, you can label them as **trees** :deciduous_tree:. This state is referenced in your frontmatter's `state` field.

Assigning the right tags to each of your plants is very important, as it then allows you to easily navigate in your garden and link them together.
In this template, you can click on one of the tags from any blog page, and see all the related ideas. 

When writing about something, this is done in the frontmatter. It also needs to include basic information, such as the **title**, **description**, **date**, and other optional parameters shown below:

```markdown
---
title: My Plant
description: A deep dive into blah blah
tags: [notes, plant]
date: 1970-01-30
related: [digital-garden] # Optional, references to other notes's `slug`
growth: sapling # Optional, but recommended, defaults to `seedling`
--- 

# My content
```

## Setting up your instance

### Github Repository

You can just fork this repository and add your own content, to do so:

#### With Github CLI (fastest)

```bash copy
gh repo fork cestef/blog.cstef.dev --clone --remote --fork-name=garden
cd garden
```

A git remote will be added to your local repository, so you can pull changes from the original repository.

```bash copy
git pull upstream main
```

#### With Git

Click on the fork button on the top right of [the GitHub page](https://github.com/cestef/blog.cstef.dev), rename it to your liking, and then clone it to your local machine.

```bash
git clone https://github.com/your-username/your-repo-name
cd your-repo-name
```

To update the template, you can pull the changes from the original repository:

```bash copy
git remote add upstream https://github.com/cestef/blog.cstef.dev.git
git pull upstream main
```

### Local development

This project uses [`pnpm`](https://pnpm.io) as its package manager. To install the dependencies:

```bash copy
pnpm install
```

To run a local development server:

```bash copy
pnpm dev
```

This will boot up [`astro`](https://astro.build) and the website will update as you edit your content.

## Adding content

To add a new blog post, you can create a new markdown file in the `src/content/blog` directory. The file name will be used as the URL slug, and the content will be parsed as markdown.
