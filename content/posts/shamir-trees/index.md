+++
title = "Tree-t Your Secrets Right"
description = "What happens if we mix Shamir Secret Sharing with boolean circuits ?"
date = 2025-11-25
draft = true
[taxonomies]
tags = ["crypto"]
+++

I've already talked quite a lot about [SSS](@/posts/shamir/index.md) (Shamir Secret Sharing) and had very deep interest in its various usage possibilities, but yeah, here we are again.

Up until now, I had a very basic and high-level knowledge of boolean logic. I then started taking Logical Systems classes at my uni. This clearly wasn't anything insurmountable, but it allowed me to take into consciousness what complex circuits were made of.

As I was proof-reading my old Shamir post out of boredom, it clicked:

> What if we wanted to apply any other logic than just "k out of n" to secret reconstruction?

I learned that pretty much any logical function can be expressed with $not$, $and$ and $or$. This can be trivially proven:

Let's suppose we have a boolean function $F(A, B, C), space A,B,C in {0, 1}$.
Its outputs can be represented with a truth table depending on its inputs:

| $A$ | $B$ | $C$ | $F(A, B, C)$ |
| - | - | - | - |
| 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 0 |
| 0 | 1 | 0 | 1 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 0 | 1 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |
| 1 | 1 | 1 | 1 |

Which we can interpret as:

To get $F(A, B , C) = 1$, we need to have either:

- $A = 0, B = 1, C = 0$
- $A = 1, B = 0, C = 0$
- $A = 1, B = 1, C = 0$
- $A = 1, B = 1, C = 1$

Which, as a boolean expression, is:

$$
(overline(A) and B and overline(C)) or (A and overline(B) and overline(C)) or (A and B and overline(C)) or (A and B and C)
$$

This is basically just the sum of the minterms of $F(A,B,C)$. And if we take a look at what operations we used here, we see that we effectively only used the three mentioned above.

## Translating to Shamir

In a typical Shamir scheme, we require "k out of n", where $k-1$ is our polynomial's degree $f(x)$, which satisfies $f(0) = s$, with $s$ being our secret value. Let's now suppose we want a specific circuit to be satisfied (i.e. its output should be 1) to allow for the reconstruction of our share. We would need to implement all 3 fundamental logical gates with Shamir schemes.

Starting off with the easiest one out of the three, a n-inputs OR gate can be constructed with a "1 out of n" Shamir scheme.

The n-inputs AND Gate basically means that we require all n shares to be present, in other terms: a "n out of n" Shamir scheme.

Now here's the not-so-fun part: we can't make a NOT Gate. Why is that?

## The NOT Problem

## References / Suggested Readings

- **Succinct Computational Secret Sharing
for Monotone Circuits**  
  George Lu, Shafik Nassar, Brent Waters  
  [eprint.iacr.org](https://eprint.iacr.org/2025/850.pdf) <small>[PDF]</small>
