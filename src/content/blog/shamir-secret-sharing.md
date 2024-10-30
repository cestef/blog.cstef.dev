---
title: Shamir's Secret Sharing Inner workings
tags: [cryptography]
description: My journey to learning how this elegant algorithm works.
date: 2024-10-30
growth: seedling
---

## Introduction

As I was talking about maths with a friend of mine, he mentioned modular arithmetic. Even though I had no idea what this was, the subject really seemed interesting: In the realm of $RR^n$, we typically operate with an infinite number of elements. However, what if we were to restrict ourselves to a finite set of, let's say, $256$ elements? 

Let's take a simple equation to demonstrate this way of thinking:

$$
f(x) = x^2 + x - 3
$$

The graph associated with this equation looks like this:

```typst
#import "@preview/cetz:0.3.1": *
#import "@preview/cetz-plot:0.1.0": plot, chart

#let f1(x) = 0.5*calc.pow(x, 2) + x - 3 ;

#set text(size: 10pt)

#canvas({
    import draw: *

    // Set-up a thin axis style
    set-style(
        axes: (
            stroke: .5pt, 
            tick: (
                stroke: .5pt
            )
        ),
        legend: (
            stroke: none, 
            orientation: ttb, 
            item: (
                spacing: .3
            ), 
            scale: 80%
        )
    )

    plot.plot(
        size: (12, 10),
        axis-style: "school-book",
        x-tick-step: 1,
        y-tick-step: 1, y-min: -5, y-max: 5,
        legend: "inner-north-east",
        legend-style: (
            stroke: black,
            fill: none,
            radius: 5pt,
            padding: .5em,
        ),
        {
            let domain = (-5.5, 5.5)
            plot.add(f1, domain: domain, label: $ f(x)  $,
            style: (stroke: rgb(100, 100, 255, 150)))
        }
    )
})
```

Now let's instead consider:

$$
g(x) = x^2 + 3x - 2 space (mod space 5)
$$

For $x in NN$:

```typst
#import "@preview/cetz:0.3.1": *
#import "@preview/cetz-plot:0.1.0": plot, chart

#let g1(x) = calc.rem-euclid(calc.pow(x, 2) + x - 3, 5);

// #let points = range(-50, 51).map(e => (e/10, g1(e/10)));

#set text(size: 10pt)

#canvas({
    import draw: *

    // Set-up a thin axis style
    set-style(
        axes: (
            stroke: .5pt, 
            tick: (
                stroke: .5pt
            )
        ),
        legend: (
            stroke: none, 
            orientation: ttb, 
            item: (
                spacing: .3
            ), 
            scale: 80%
        )
    )

    plot.plot(
        size: (12, 8),
        axis-style: "school-book",
        x-tick-step: 2,
        y-tick-step: 1, 
        y-min: 0, 
        y-max: 5,
        legend: "inner-north-east",
        legend-style: (
            stroke: black,
            fill: none,
            radius: 5pt,
            padding: .5em,
        ),
    
        {
            let domain = (-10.5, 10.5)
            plot.add(
                g1, 
                domain: domain, 
                label: $ g(x)  $,
                style: (
                    stroke: rgb(100, 100, 255, 150)
                ),
                // mark: "o",
                mark-style: (
                    fill: rgb(100, 100, 255, 255), 
                    stroke: none
                ),
                line: "linear",
            )
        }
    )
})
```

We can now see $x$ oscillating between $[0;5[$ as the modulo acts as a "wrap-around" operation. Finite Field (also known as Galois Field) make extensive use of this property to ensure that every operation on two numbers $a,b in E$, e.g. $a+b$, stays in $E$. More generally, we say that any Finite Field $FF_q$ with $q = p^k | p in cal(P)$ is **isomorphic**.

### Polynomials

One of the most, if not *the* most important property of polynomials, is that each one of them can uniquely be described by $n$ points for a polynomial of degree $n$, noted $P_n(x)$.

The most straightfoward way of seeing this is by setting an equation for each point $A_i (x_i, y_i)$ we have:
$$
P_n (x) = u_0 + u_1 x + ... + u_(n-1) x^(n-1) = f(x) \

cases(
    space f(x_0) = y_0,
    space f(x_1) = y_1,
    space ...,
    space f(x_n) = y_n,
)
$$

We can see that we have $n$ equations for $n$ factors of $x$, which could also be represented with the following matrix equation:

$$
mat(
    1, x_0, x_0^2, ..., x_0^(n-1);
    1, x_1, x_1^2, ..., x_1^(n-1);
    dots.v, dots.v, dots.v, dots.down, dots.v;
    1, x_n, x_n^2, ..., x_n^(n-1);
)
mat(u_0; u_1; ...; u_(n-1)) = mat(y_0; y_1; ...; y_n)
$$

If you prefer to see this in a graphical way, let's consider the following example:

We have two points $A_0 (1, 2)$ and $A_1 (-2, -3)$. We can represent them as follows:

```typst
#import "@preview/cetz:0.3.1": *

#canvas({
    import draw: *

    grid((-5, -5), (5, 5), step: 1, stroke: gray + 0.2pt)
    line((-5, 0), (5, 0))
    line((0, -5), (0, 5))
    mark((5,0), (6,0), symbol: ">", fill: black)
    mark((0,5), (0,6), symbol: ">", fill: black)
    circle((1, 2), radius: 0.125, fill: black, name :"a_0")
    circle((-2, -3), radius: 0.125, fill: black, name :"a_1")
    content("a_0", [$A_0$], anchor: "north-west", padding: 0.1)
    content("a_1", [$A_1$], anchor: "north-west", padding: 0.1)
})
```

It is visually obvious that we can only draw a single line that goes through both points.

```typst
#import "@preview/cetz:0.3.1": *
#let m = (2 + 3) / (1 + 2);
#let b = 2 - m;
#let f(x) = m * x + b;

#canvas({
    import draw: *

    grid((-5, -5), (5, 5), step: 1, stroke: gray + 0.2pt)
    line((-5, 0), (5, 0))
    line((0, -5), (0, 5))
    mark((5,0), (6,0), symbol: ">", fill: black)
    mark((0,5), (0,6), symbol: ">", fill: black)
    line((-3, f(-3)), (2.5, f(2.5)), stroke: rgb(100, 100, 255, 200) + 2pt)
    circle((1, 2), radius: 0.125, fill: black, name :"a_0")
    circle((-2, -3), radius: 0.125, fill: black, name :"a_1")
    content("a_0", [$A_0$], anchor: "north-west", padding: 0.1)
    content("a_1", [$A_1$], anchor: "north-west", padding: 0.1)
})
```
## Background

## How Shamir's Secret Sharing Works

## Rust Implementation

## Challenges Faced

## Use Cases

## Conclusion

## References / Suggested readings