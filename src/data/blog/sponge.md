---
title: SquarePants Sponge Hashing
description: A quick explaination of the sponge hashing algorithm, notably used in SHA-3
tags: [cryptography,maths]
date: 2024-11-21
growth: seed
---

In 2007, the NIST (National Institue of Standards and Technology) announced a Cryptographic Hash Algorithm Competition, with the winner being awarded the grant to be standardized as the new SHA-3. It ended in 2012 with $#smallcaps("K​")script(#smallcaps("ECCAK"))$ being announced as the winner.

The function uses a **sponge construction**, but what the hell is even this thing? Let's take a look!

We have a message $M$ as our input and the final hash $H$. We then have two "registers": $r$ and $c$, which both make up our state $s$. These two are initialized with $0$s in them. 

The message $M$ is first padded so that it can fit in exactly $k in NN$ parts $m_i$, each of size $r$. The process of "absorption" is the following:

1. XOR (denoted $xor$) the message-part $m_i$ with the register $r$ bit-by-bit
2. Scramble the whole register $s$ ($r$ and $c$) altogether to produce a new state $s'$ by applying $f$
    The function $f$ needs to generate a pseudo-random permutation of the bits in $s$

```typst
#import "@preview/fletcher:0.5.2" as fletcher: *

#diagram(
  spacing: (15mm, 0mm),
  cell-size: (0mm, 0mm),
  node-stroke: 1pt,
  node-shape: rect,
  node((-6mm, 85pt), $r space cases(,,,,,,)$, stroke: none),
  node((-6mm, 21pt), $c space cases(,,,)$, stroke: none),
  node((35mm, 85pt), [#rotate(180deg)[$#rotate(180deg, $r'$) cases(,,,,,,)$]] , stroke: none),
  node((35mm, 21pt), [#rotate(180deg)[$#rotate(180deg, $c'$) cases(,,,)$]] , stroke: none),
  node((0,0), "1"),
  node((0,1), "0"),
  node((0,2), "1"),
  node((0,3), "0"),
  node((0,4), "0"),
  node((0,5), "1"),

  node((1,0), "1"),
  node((1,1), "0"),
  node((1,2), "1"),
  node((1,3), "0"),
  node((1,4), "0"),
  node((1,5), "1"),

  edge((0,0), (1,1.2), "-|>"),
  edge((0,.6), (1,4.5), "-|>"),
  edge((0,2.4), (1,-.8), "-|>"),
  edge((0,3), (1,1.8), "-|>"),
  edge((0,4), (1,5.2), "-|>"),
  edge((0,5), (1,2.6), "-|>"),
)
```
<p align="center"
><small> Example permuation <i>via</i> <code class="language-math language-typst">f</code></small></p>

3. Pass on the state to the next iteration

We can now "squeeze" our sponge to extract the hash from it, by applying $f$ again and taking a small chunk $h_i$ over and over until we have enough for our desired output length. 

This whole process can be described with the following diagram:

```typst
#import "@preview/fletcher:0.5.2" as fletcher: *

#diagram(
  spacing: (10mm, 0mm),
  cell-size: (0mm, 15mm),
  node((0,0), $M$),
  edge("-|>"),
  node((0,1), `pad()`),
  // node((0, 2), enclose: ((0,2), (0,5)), name: <s>),
  node((0,2), $r$, shape: rect, stroke: 1pt, height: 25mm),
  node((0,3), $c$, shape: rect, stroke: 1pt, height: 15mm),
  node((-.45, 2.38), $s space space cases(,,,,,,,,)$),
  node((1,2.25), $f$, shape: rect, corner-radius: .75em, stroke: 1pt, height: 30mm),
  edge((0, 3), (.5,3), (.5, 2.5), (1, 2.5), "-|>"),
  edge((0, 2), (1, 2), "-|>", label: $xor$, label-side: center),
  edge((0,1), (0.5, 1), (.5, 1.9), "-|>", label: $m_0$, label-pos: 0.7, label-side:center),
  node((2.5,2.25), $f$, shape: rect, corner-radius: .75em, stroke: 1pt, height: 30mm),
  edge((1, 2.5), (2.5,2.5), "-|>"),
  edge((1, 2), (2.5,2), "-|>", label: $xor$, label-side: center),
  edge((0,1), (1.72, 1), (1.72, 1.9), "-|>", label: $m_1$, label-pos: 0.7, label-side: center),
  edge((2.5, 2), (4.5,2), "--|>"),
  edge((2.5, 2.5), (4.5,2.5), "--|>"),
  node((4.5,2.25), $f$, shape: rect, corner-radius: .75em, stroke: 1pt, height: 30mm),
  edge((4.5, 2.5), (5.75,2.5), "-|>"),
  edge((4.5, 2), (5.75,2), "-|>"),
  node((5.75,2.25), $f$, shape: rect, corner-radius: .75em, stroke: 1pt, height: 30mm),
  edge((3.5, 3.75), (3.5,1), "--", stroke: 1.125pt),
  edge((5.125, 2), (5.125, 1), (7.865, 1), (7.865, 0), "-|>", label: $h_0$, label-side: center, label-pos:0.22),
  edge((6.3, 2), (6.3, 1), (7.865, 1), (7.865, 0), "-|>", label: $h_1$, label-side: center, label-pos: 0.23),
  node((7.865,0), $H$),
  node((6.865,2.25), $f$, shape: rect, corner-radius: .75em, stroke: 1pt, height: 30mm),
  edge((6, 2),(6.865, 2), "-|>"),
  edge((6, 2.5),(6.865, 2.5), "-|>"),
  node((7.865, 2.25), $f$, shape: rect, corner-radius: .75em, stroke: 1pt, height: 30mm),
  edge((7, 2), (7.865,2), "--|>"),
  edge((7, 2.5), (7.865,2.5), "--|>"),
  edge((7.36, 2), (7.36, 1), (7.865, 1), (7.865, 0), "-|>", label: $h_ell$, label-side: center, label-pos: 0.23),
)
```

<p align="center"><small>Sponge construction algorithm, inspired by <a href="https://keccak.team/sponge_duplex.html">Keccak's diagram</a></small></p>

This whole process can also be modified to fit streaming needs, by combining both absorption and squeezing steps at each iteration. This has been proven to be [equally secure]() to the classic way of doing things

```typst
#import "@preview/fletcher:0.5.2" as fletcher: *

#diagram(
  spacing: (10mm, 0mm),
  cell-size: (0mm, 15mm),
  node((0,0), $M$),
  edge("-|>"),
  node((0,1), `pad()`),
  // node((0, 2), enclose: ((0,2), (0,5)), name: <s>),
  node((0,2), $r$, shape: rect, stroke: 1pt, height: 25mm),
  node((0,3), $c$, shape: rect, stroke: 1pt, height: 15mm),
  node((-.45, 2.38), $s space space cases(,,,,,,,,)$),
  node((1,2.25), $f$, shape: rect, corner-radius: .75em, stroke: 1pt, height: 30mm),
  edge((0, 3), (.5,3), (.5, 2.5), (1, 2.5), "-|>"),
  edge((0, 2), (1, 2), "-|>", label: $xor$, label-side: center),
  edge((0,1), (0.5, 1), (.5, 1.9), "-|>", label: $m_0$, label-pos: 0.7, label-side:center),
  node((3.5,2.25), $f$, shape: rect, corner-radius: .75em, stroke: 1pt, height: 30mm),
  edge((1, 2.5), (3.5,2.5), "-|>"),
  edge((1, 2), (3.5,2), "-|>", label: $xor$, label-side: center, label-pos: 0.7),
  edge((0,1), (2.65, 1), (2.65, 1.9), "-|>", label: $m_1$, label-pos: 0.7, label-side: center),
  edge((1.75, 2), (1.75, .75), (5.5, .75), (5.5, 0), "-|>", label: $h_0$, label-side:center, label-pos: 0.175),
  node((5.5,0), $H$),
  node((5.5,2.25), $f$, shape: rect, corner-radius: .75em, stroke: 1pt, height: 30mm),
  edge((3.5, 2.5), (5.5,2.5), "-|>"),
  edge((3.5, 2), (5.5,2), "-|>", label: $xor$, label-side: center, label-pos: 0.7),
    edge((0,1), (4.835, 1), (4.835, 1.9), "-|>", label: $m_2$, label-pos: 0.7, label-side: center),
  edge((4.2, 2), (4.2, .75), label: $h_1$, label-side: center, label-pos:0.5),
  node((6, 2.2), $dots$)
)
```