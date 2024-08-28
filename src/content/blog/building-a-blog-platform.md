---
title: Building a Dynamic Blog Platform with Astro and GitHub
tags: [blog, astro, github]
description: Learn how I built uses.ink, a dynamic blog platform that uses Astro and GitHub to generate and host content.
date: 2024-08-25
---

In the recent years, almost every developer has built a blog at some point. It's a great way to share your knowledge and experiences with the world. But building a blog platform from scratch can be a daunting task. You have to worry about things like content management, hosting, and SEO. Many developers opt for static site generators like Gatsby or Next.js to simplify the process. 

But what if I told you that you could just push markdown files to a GitHub repository and have a fully functional blog up and running in seconds? That's exactly what I did with `uses.ink`, an open-source blog platform which uses Astro and GitHub to generate and host content. In this article, I'll walk you through how I built it and how you can set up your own blog!

## What is Astro?

Astro is rapidly gaining traction as a powerful framework for building modern websites. It supports a wide range of front-end technologies like React, Vue, and Svelte, and even supports SSR and SSG out of the box. Astro is designed to be fast, flexible, and developer-friendly. It's a great choice for building blogs, portfolios, and other content-driven websites.

This looked like the perfect tool for building my platform! I had first written a PoC in Next.js, but webpack was a bit too messy for my taste. Astro was a breath of fresh air, and I was able to get a working prototype up and running in no time. Very cool!

## How does `uses.ink` work?