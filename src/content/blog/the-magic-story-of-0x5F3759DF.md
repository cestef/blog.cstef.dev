---
title: The Magic Story of 0x5F3759DF
tags: [maths]
description: Perhaps one of the most famous bit hacks in computer science history, the magic number 0x5F3759DF is used to calculate the inverse square root of a floating-point number.
date: 2024-09-04
growth: seedling
---

The magic number `0x5F3759DF` is one of the most famous bit hacks in computer science history. It's used to calculate the inverse square root of a floating-point number with astonishing speed and accuracy at the time. The method was popularized by John Carmack in the source code of the Quake III Arena engine.

## The Problem

With the rise of 3D video games, the need for fast square root calculations became apparent. In 3D graphics, normalizing a vector (for lighting calculations, for instance) requires calculating the length of the vector, which involves taking the square root of the sum of the squares of its components. This operation is computationally expensive and can slow down rendering.

Let's say we have a vector $arrow(v) = vec(x,y,z)$. Its length is given by the formula:

$$
norm(arrow(v)) = sqrt(x^2 + y^2 + z^2)
$$

However, the length of the vector can mess up our calculations, and we need to have a **normalized vector**.

To have a normalized vector, we need to have $norm(arrow(v)) = 1$. This means we need to calculate the reciprocal of the square root of the sum of the squares of the components:

$$
arrow(n) = arrow(v) / norm(arrow(v)) = arrow(v) * (1 / norm(arrow(v))) = arrow(v) * (1 / sqrt(x^2 + y^2 + z^2))
$$

CPU instructions in the 90s clearly did not like square roots and divisions: for reference, here is the comparative cost of some operations on a Pentium processor (P5):

| **Floating-Point Operation** | **Clock Cycles** |
| ---------------------------- | ---------------- |
| Addition (FADD)              | 3                |
| Multiplication (FMUL)        | 3                |
| Division (FDIV)              | 39               |
| Square Root (FSQRT)          | 70               |

Well, that's unlucky, we're using both a division and a square root in our normalization process. Computers are fast, but they're not *that* fast, especially when you're trying to render a 3D scene at 60 frames per second. Let's try to estimate of much cycles it would take only to normalize a single vector:

$$ 
3 dot 3 + 2 dot 3 + 70 + 39 = 136 "cycles"
$$

That's a lot of cycles for a single vector normalization. If you're doing this for every vertex in a 3D scene, you're going to have a bad time.

## The Solution

John Carmack, the legendary programmer behind games like Doom and Quake, needed a faster way to calculate the inverse square root. He came up with a clever hack that would change the way floating-point calculations were done in 3D graphics.

But where the heck did he get the magic number `0x5F3759DF` from? It's not a number you'd stumble upon by accident. The number is actually a starting point for an iterative process that refines an approximation of the inverse square root.

The magic formula is as follows:

```c
float Q_rsqrt(float number)
{
  long i;
  float x2, y;
  const float threehalfs = 1.5F;

  x2 = number * 0.5F;
  y  = number;
  i  = * ( long * ) &y; // evil floating point bit level hacking
  i  = 0x5f3759df - ( i >> 1 ); // what the f*ck?
  y  = * ( float * ) &i;
  y  = y * ( threehalfs - ( x2 * y * y ) ); // 1st iteration
  // y  = y * ( threehalfs - ( x2 * y * y ) ); // 2nd iteration, this can be removed

  return y;
}
```
<figcaption>
Code stripped from the C preprocessor (<a href="https://web.archive.org/web/20170729072505/https://github.com/id-Software/Quake-III-Arena/blob/master/code/game/q_math.c#L552">source</a>)
</figcaption>

Let's break down the code:

1. The function `Q_rsqrt` takes a floating-point number as input and returns an approximation of the inverse square root.
2. The function starts by initializing some variables: `x2` is half of the input number, `y` is the input number, and `threehalfs` is 1.5.
3. The function then performs some bit manipulation on the floating-point representation of `y`. This is where the magic happens.
4. The magic number `0x5f3759df` is subtracted from the bit-manipulated `i` value. This is the heart of the algorithm.
5. The function then performs an iterative refinement of the approximation using the Newton-Raphson method.

