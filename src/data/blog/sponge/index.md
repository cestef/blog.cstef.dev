---
title: SquarePants Sponge Hashing
description: A quick explaination of the sponge hashing algorithm, notably used in SHA-3
tags: [cryptography]
date: 2025-01-06
growth: sapling
---

In 2007, the NIST (National Institue of Standards and Technology) announced a Cryptographic Hash Algorithm Competition, with the winner being awarded the grant to be standardized as the new SHA-3. It ended in 2012 with $#smallcaps("K​")script(#smallcaps("ECCAK"))$ being announced as the winner.

The function uses a **sponge construction**, but what the hell is even this thing? Let's take a look!

We have a message $M$ as our input and the final hash $H$. We then have two "registers": $r$ and $c$, which both make up our state $s$. These two are initialized with $0$s in them. 

The message $M$ is first padded so that it can fit in exactly $k in NN$ parts $m_i$, each of size $r$. The process of "absorption" is the following:

1. XOR (denoted $xor$) the message-part $m_i$ with the register $r$ bit-by-bit
2. Scramble the whole register $s$ ($r$ and $c$) altogether to produce a new state $s'$ by applying $f$
    The function $f$ needs to generate a pseudo-random permutation of the bits in $s$

@include figures/permutation.typ

<p align="center"
><small> Example permutation <i>via</i> <code class="language-math language-typst">f</code></small></p>

3. Pass on the state to the next iteration

We can now "squeeze" our sponge to extract the hash from it, by applying $f$ again and taking a small chunk $h_i$ over and over until we have enough for our desired output length. 

This whole process can be described with the following diagram:

@include figures/classic.typ


<p align="center"><small>Sponge construction algorithm, inspired by <a href="https://keccak.team/sponge_duplex.html">Keccak's diagram</a></small></p>

This whole process can also be modified to fit streaming needs, by combining both absorption and squeezing steps at each iteration.

@include figures/streaming.typ