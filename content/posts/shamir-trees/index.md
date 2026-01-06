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

When adding new information (having a new share), we can't really "subtract" it from what we already had.
Let's take a step back and reason with linear algebra in mind to try to understand why.

If we suppose our secret is the vector $arrow(s)$, we are trying to find a vector combination to reach that vector.
Here come Bob, Alice and Charlie:

Our secret is at $arrow(s) = (0, 10)$, Alice's share is $arrow(v_A) = (1, 2)$,
Bob's share is $arrow(v_B) = (1, 0)$,
Charlie's share is $arrow(v_C) = (3,3)$. Also note that all of the protagonist vectors are linearly independent.

<details>

<summary>
Linearly independent?
</summary>

Just a fancy way of saying that every vector is **not** a "whole" ($in ZZ$) multiple of another one.

</details>

If Alice was to try to reach $arrow(s)$ with her vector alone:

$$
lambda_A dot arrow(v_A) = arrow(s), space lambda_A in ZZ_q
$$

It's impossible. She can go up to $(5 dot 1, 5 dot 2) = (5, 10)$ with $lambda_A = 5$
but there's no solution in $ZZ_q$ for $(0, 10)$.

However, if we were to add Bob's share-vector $arrow(v_B) = (1, 0)$:

$$
lambda_A dot arrow(v_A) + lambda_B dot arrow(v_B) = arrow(s), space lambda_(A,B) in ZZ_q
$$

There is now a solution to the equation:

$$
5 dot arrow(v_A) - 5 dot arrow(v_B) = (5, 10) - (5, 0) =(0, 10) = arrow(s)
$$

You may have noticed it, this is basically just a fancy way of writing the equation system we're trying to solve
(which we usually do with [Lagrange's interpolation](@/posts/lagrange/index.md))

$$
cases(
  space lambda_A dot 1 + lambda_B dot 1 = 0,
  space lambda_A dot 2 + lambda_B dot 0 = 10
)
$$

Without the two shares of Alice and Bob, our system would just look like

$$
cases(
  space lambda_A dot x_A + lambda_B dot x_B = 0,
  space lambda_A dot y_A + lambda_B dot y_B = 10
)
$$

With our unknowns: $arrow(v_A) = (x_A, y_A)$ and $arrow(v_B) = (x_B, y_B)$

Back to our share-vectors, if we were to add Charlie's $v_C = (3,3)$

$$
lambda_A dot arrow(v_A) + lambda_B dot arrow(v_B) + lambda_C dot arrow(v_C) = arrow(s), space lambda_(A,B) in ZZ_q
$$

Our first solution is still valid, we can just set $lambda_C = 0$ and ignore it. Adding new vectors to a base of vectors can't shrink its span.
In other terms, adding new information can't discard previous solutions in this case.

### The "Solution(s)"

Instead of explicitely excluding a share, we can accept every combination of shares that does **not** include this excluded share.
This has the massive downside of generating _very very large_ circuits when the number of shares increases.

$$
C_k^n = (n!)/(k!(n-k)!)
$$

<p align="center">
<small>
this bad boy right here
</small>
</p>

Rafail Ostrovsky, Amit Sahai and Brent Waters mention an other clever solution:

> Instead of making a specified share invalid, just make it useless.

## References / Suggested Readings

- **Succinct Computational Secret Sharing for Monotone Circuits**  
  George Lu, Shafik Nassar, Brent Waters  
  [eprint.iacr.org](https://eprint.iacr.org/2025/850.pdf) <small>[PDF]</small>
- **Attribute-Based Encryption with Non-Monotonic Access Structures**  
  Rafail Ostrovsky, Amit Sahai and Brent Waters  
  [eprint.iacr.org](https://eprint.iacr.org/2007/323.pdf) <small>[PDF]</small>
