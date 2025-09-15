+++
title = "No Ads, No Algorithms, No Problem"
description = "Big techs hate it! This one simple trick lets you read what you want"
date = 2025-03-21

[taxonomies]
tags = ["rss"]
+++

Back when the Internet was still young (I wasn't even born), folks would dial up to their favorite BBS (Bulletin Board System) and dive into whatever people were talking about.
It was so basic - just pure text posts lined up by date. No flashy ads, no infinite-doomscroll apps.
Just people talking to each other.

```ansi,center
[32m                    __
[32m                   /  \      r e a l i t y c h e c k B B S
[32m                  /|oo \[34m             san francisco, ca usa
[32m                 (_|  /_)              [1mrealitycheckbbs.org
                [2m _[0m[32m`@/[0m[2m_[0m[32m \     _[34m              via telnet/web
                [2m|     |[0m[32m \    \\
                [2m| (*) |[0m[32m  \    ))
                [2m|__U__|[0m[32m /  \ //          [34mfidonet 1:218/700
[32m    ______        _//|| _\   /           [34mregion 10 mailhub
[32m   / fido \      (_/(_|(____/        [34mcalifornia/nevada usa
[32m  (________)          [0m[2m(jm)[2m
```

<p align="center"><small>They had cool ASCII arts too </small></p>

Then, as everyone's grandmother started getting online, the Internet turned into this crazy fight for eyeballs. Companies began watching everything you clicked, trying to get inside your head. Suddenly, you're drowning in ads, getting pushed toward certain articles, and your feed's all shuffled around just to keep you glued to your screen.

Today's Internet feels like walking into a library where librarians follow you around, constantly swapping books on the shelves based on which covers you glance at longest. Look at a cookbook for too long, and suddenly the poetry section is full of food-themed sonnets. Want to read a novel? Too bad, you're getting a comic book today. It's like the whole place is trying to sell you something, and it's _exhausting_.

## Return to Roots

A quite funny thing happened, though. People started realizing. Realizing that their addiction to these never-ending streams of content was making them miserable.

That's when some Internet old-timers started whispering about something that had been there all along: **RSS**. Really Simple Syndication. A technology from the early 2000s that never actually died, just got buried under mountains of algorithmic feeds and walled gardens.
RSS is beautifully simple. You choose what websites you want to follow, and their latest posts come to you in chronological order. You very own (free) newspaper, curated by you.

It typically looks like this:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
    <channel>
        <title>RSS Title</title>
        <description>This is an example of an RSS feed</description>
        <link>http://www.example.com/main.html</link>
        <copyright>2020 Example.com All rights reserved</copyright>
        <lastBuildDate>Mon, 6 Sep 2010 00:01:00 +0000</lastBuildDate>
        <pubDate>Sun, 6 Sep 2009 16:20:00 +0000</pubDate>
        <ttl>1800</ttl>

        <item>
            <title>Example entry</title>
            <description>An interesting description.</description>
            <link>http://www.example.com/blog/post/1</link>
            <pubDate>Sun, 6 Sep 2009 16:20:00 +0000</pubDate>
        </item>
    </channel>
</rss>
```

## How to Use RSS

### As a Reader

1. **Find an RSS Reader**: There are many out there, but some popular ones are [NetNewsWire](https://ranchero.com/netnewswire/), [Glance](https://github.com/glanceapp/glance), [Folo](https://folo.is/) or [miniflux](https://miniflux.app/) (my favorite)
2. **Subscribe to Websites**: Sometimes this is as easy as pasting the website's URL into your reader. Other times, you might need to look for an icon like this: <img alt="RSS icon" src="images/rss.png" style="width: 1.5rem; height: 1.5rem; border-radius: 0px; display: inline-block; vertical-align: text-bottom;"> or try your luck with `/(feed|rss|atom)(\.xml)?` at the end of the URL.

   For websites/content sources that don't have an RSS feed (e.g. Telegram channels), you can use a bridge service like [RSSHub](https://docs.rsshub.app/) to generate one.

3. **Enjoy**: At the beginning, you may find it a bit underwhelming to have a feed with just a few posts. But as you add more and more sources, you'll have a personalized feed that's just right for you.

### As a Publisher

Most static site generators already support RSS feed generation. Very often, it's just a matter of enabling it in the configuration file or installing a package. Here's a list of some popular static site generators and their documentation on RSS feed generation:

| Static Site Generator | Documentation                                                                                   | Enabled by Default |
| --------------------- | ----------------------------------------------------------------------------------------------- | ------------------ |
| Hugo                  | [gohugo.io](https://gohugo.io/templates/rss/)                                                   | Yes                |
| Jekyll                | [jekyllrb.com](https://jekyllrb.com/tutorials/convert-site-to-jekyll/#10-rss-feed)              | No                 |
| Zola                  | [getzola.org](https://www.getzola.org/documentation/templates/feeds/)                           | No                 |
| Pelican               | [docs.getpelican.com](https://docs.getpelican.com/en/stable/settings.html#feed-settings)        | Yes (Atom)         |
| Gatsby                | [gatsbyjs.com](https://www.gatsbyjs.com/docs/how-to/adding-common-features/adding-an-rss-feed/) | No                 |
| Astro                 | [docs.astro.build](https://docs.astro.build/en/recipes/rss/)                                    | No                 |
| Eleventy              | [11ty.dev](https://www.11ty.dev/docs/plugins/rss/)                                              | No                 |

If your static site generator doesn't support RSS feed generation, get your hands dirty and write a script to do it! It's not that hard, and you'll learn a lot in the process :^)

## Atom ? RSS ?

You might have heard of [Atom](https://en.wikipedia.org/wiki/Atom_(web_standard)) feeds as well. Atom is another XML-based web feed format that's quite similar to RSS. Atom was created in 2005 as an alternative to RSS, and it's a bit more modern and extensible. But in practice, the two formats are pretty much interchangeable. Most feed readers can handle both, pick one and stick with it, you'll be fine. (no harm in supporting both though)

## Conclusion

By choosing RSS, you’re doing more than just avoiding ads and reclaiming your attention. You’re keeping a part of the open web alive. Every time you subscribe to an independent feed instead of surrendering to a corporate timeline, you’re voting for a better internet — one that values choice over control, curiosity over clicks, and depth over dopamine hits.

If that’s the kind of web you want to exist, start using it. Start sharing it. And maybe, just maybe, we can make it happen.
