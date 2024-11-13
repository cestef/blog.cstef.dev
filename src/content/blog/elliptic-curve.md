---
title: Elliptic Curve Cryptography for Sane People
tags: [cryptography, maths]
description: A gentle introduction to elliptic curve cryptography and a few concepts around it, without the need for a PhD in mathematics.
date: 2024-10-30
growth: sapling
---

> [!INFO]
> I am not a cryptographer, nor a mathematician. This article is the result of my own research and understanding of the subject. If you find any mistakes, [please let me know](mailto:hi@cstef.dev)!
>
> The vast majority of what is written here is taken from various sources, which are listed at the [end of this article](#references--suggested-readings). I highly recommend you to read them if you want to dive deeper into the subject.

## Introduction

While chatting about math with a friend, he brought up modular arithmetic—a concept I hadn’t heard of but was instantly intrigued by. Imagine this: instead of dealing with endless numbers, what if we worked within a closed loop, where everything resets after hitting, say, $79$? Modular arithmetic does exactly that, turning numbers into a finite, repeating cycle that unlocks surprising properties and patterns.

Let's take a simple equation to demonstrate this way of thinking:

$$
f(x) = x^2 + x - 3
$$

The graph associated with this equation looks like this:

```typst
#let f1(x) = 0.5*calc.pow(x, 2) + x - 3 ;

#set text(size: 10pt)

#canvas({
    import draw: *

    
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
            style: (stroke: blue + 2pt))
        }
    )
})
```

Now let's instead consider:

$$
g(x) = x^2 + 3x - 2 space (mod space 79)
$$

For $x in NN$:

```typst
#let g1(x) = calc.rem-euclid(calc.pow(x, 2) + x - 3, 79	);

#set text(size: 10pt)

#canvas({
    import draw: *

    
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
        x-tick-step: 10,
        y-tick-step: 10, 
        y-min: 0, 
        y-max: 80,
        legend: "inner-north-east",
        legend-style: (
            stroke: black,
            fill: white,
            radius: 5pt,
            padding: .5em,
        ),
    
        {
            let domain = (-50.5, 50.5)
            plot.add(
                range(-50, 50).map(e => (e, g1(e))), 
                domain: domain, 
                label: $ g(x)  $,
                style: (
                    stroke: none
                ),
                mark: "o",
                mark-style: (
                    fill: blue,
                    stroke: none
                )
            )
        }
    )
})
```

We can now see $x$ oscillating between $[0;79[$ as the modulo acts as a "wrap-around" operation. Finite Fields (also known as Galois Fields) make extensive use of this property to ensure that every operation on two numbers $a,b in E$, e.g. $a+b$, stays in $E$. More generally, we say that any Finite Field $FF_q$ with $q = p^k | p in cal(P)$ is **isomorphic**.

Even though I did not see any direct-application of this, I was intrigued by this new stuff, and began digging deeper into the subject, clicking Wikipedia links after Wikipedia links. This is how I stumbled upon Shamir's Secret Sharing. But before we dive into this, let's first understand underlying concepts.

### Polynomials

One of the most, if not *the* most important property of polynomials, is that each one of them can uniquely be described by $n+1$ points for a polynomial of degree $n$, noted $P_n (x)$.

The most straightforward way of seeing this is by setting an equation for each point $A_i (x_i, y_i)$ we have:
$$
P_n (x) = u_0 + u_1 x + ... + u_n x^n = f(x) \

cases(
    space f(x_0) = y_0,
    space f(x_1) = y_1,
    space ...,
    space f(x_n) = y_n,
)
$$

We can see that we have $n+1$ equations for $n+1$ factors of $x$, which could also be represented with the following matrix equation:

$$
mat(
    1, x_0, x_0^2, ..., x_0^(n);
    1, x_1, x_1^2, ..., x_1^(n);
    dots.v, dots.v, dots.v, dots.down, dots.v;
    1, x_n, x_n^2, ..., x_n^(n);
)
mat(u_0; u_1; ...; u_(n)) = mat(y_0; y_1; ...; y_n)
$$

If you prefer to see this in a graphical way, let's consider the following example:

We have two points $A_0 (1, 2)$ and $A_1 (-2, -3)$. We can represent them as follows:

```typst
#set text(size: 10pt)

#canvas({
    import draw: *

    
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
        ),
    )

    plot.plot(
        name: "plot",
        size: (12, 8),
        axis-style: "school-book",
        x-tick-step: 1,
        y-tick-step: 1, 
        y-min: -5, 
        y-max: 5,
        x-min: -5,
        x-max: 5,
        x-grid: true,
        y-grid: true,
        legend: "inner-north-east",
        legend-style: (
            stroke: black,
            fill: none,
            radius: 5pt,
            padding: .5em,
        ),
        {
            plot.add-anchor("a_0", (1,2))
            plot.add-anchor("a_1", (-2,-3))
        }
    )
    circle("plot.a_0", radius: 0.1, fill: black, name :"a_0")
    content("a_0", [= $A_0$], anchor: "north-west", padding: 0.1)
    circle("plot.a_1", radius: 0.1, fill: black, name :"a_1")
    content("a_1", [= $A_1$], anchor: "north-west", padding: 0.1)
})
```

It is visually obvious that we can only draw a single line that goes through both points.

```typst
#set text(size: 10pt)

#canvas({
    import draw: *

    
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
        ),
    )

    plot.plot(
        name: "plot",
        size: (12, 8),
        axis-style: "school-book",
        x-tick-step: 1,
        y-tick-step: 1, 
        y-min: -5, 
        y-max: 5,
        x-min: -5,
        x-max: 5,
        x-grid: true,
        y-grid: true,
        legend: "inner-north-east",
        legend-style: (
            stroke: black,
            fill: none,
            radius: 5pt,
            padding: .5em,
        ),
        {
            let m = (-3 - 2) / (-2 - 1)
            let f(x) = m * x + 2 - m
            plot.add(f, domain: (-5, 5), style: (stroke: blue + 2pt))
            plot.add-anchor("a_0", (1,2))
            plot.add-anchor("a_1", (-2,-3))
        }
    )
    circle("plot.a_0", radius: 0.1, fill: black, name :"a_0")
    content("a_0", [= $A_0$], anchor: "north-west", padding: 0.1)
    circle("plot.a_1", radius: 0.1, fill: black, name :"a_1")
    content("a_1", [= $A_1$], anchor: "north-west", padding: 0.1)
})
```

A line is essentially just $f(x) = a x + b$, which is of degree $1$. We can guess and deduce we need at least $n+1$ points to describe a polynomial $P_n$.

The same goes if we add a third point $A_2 (0, 4)$:

```typst
#set text(size: 10pt)
#let f(x) = -(11/6) * calc.pow(x, 2) - x/6 + 4;

#canvas({
    import draw: *

    
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
        ),
    )

    plot.plot(
        name: "plot",
        size: (12, 8),
        axis-style: "school-book",
        x-tick-step: 1,
        y-tick-step: 1, 
        y-min: -5, 
        y-max: 5,
        x-min: -5,
        x-max: 5,
        x-grid: true,
        y-grid: true,
        legend: "inner-north-east",
        legend-style: (
            stroke: black,
            fill: none,
            radius: 5pt,
            padding: .5em,
        ),
        {
            plot.add(f, domain: (-5, 5), style: (stroke: blue + 2pt))
            plot.add-anchor("a_0", (1,2))
            plot.add-anchor("a_1", (-2,-3))
            plot.add-anchor("a_2", (0,4))
        }
    )
    circle("plot.a_0", radius: 0.1, fill: black, name :"a_0")
    content("a_0", [= $A_0$], anchor: "north-west", padding: 0.1)
    circle("plot.a_1", radius: 0.1, fill: black, name :"a_1")
    content("a_1", [= $A_1$], anchor: "north-west", padding: 0.1)
    circle("plot.a_2", radius: 0.1, fill: black, name :"a_2")
    content("a_2", [= $A_2$], anchor: "south-west", padding: 0.1)
})
```

If we did not add this third point and still tried to find a polynomial $P_2 (x)$, we would have an infinite number of solutions:

```typst
#set text(size: 10pt)
#let f(x, b) = ((3 * b - 5) / 3) * calc.pow(x, 2) + b * x + ((11 - 6 * b) / 3)
#let f1(x) = f(x, 1)
#let f2(x) = f(x, 2)
#let f3(x) = f(x, 3)

#canvas({
    import draw: *

    
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
        ),
    )

    plot.plot(
        name: "plot",
        size: (12, 8),
        axis-style: "school-book",
        x-tick-step: 1,
        y-tick-step: 1, 
        y-min: -5, 
        y-max: 5,
        x-min: -5,
        x-max: 5,
        x-grid: true,
        y-grid: true,
        legend: "inner-north-east",
        legend-style: (
            stroke: black,
            fill: none,
            radius: 5pt,
            padding: .5em,
        ),
        {
            plot.add(f1, domain: (-5, 5), style: (stroke: blue + 2pt))
            plot.add(f2, domain: (-5, 5), style: (stroke: green + 2pt))
            plot.add(f3, domain: (-5, 5), style: (stroke: red + 2pt))
            plot.add-anchor("a_0", (1,2))
            plot.add-anchor("a_1", (-2,-3))
        }
    )
    circle("plot.a_0", radius: 0.1, fill: black, name :"a_0")
    content("a_0", [= $A_0$], anchor: "west", padding: 0.25)
    circle("plot.a_1", radius: 0.1, fill: black, name :"a_1")
    content("a_1", [= $A_1$], anchor: "south-east", padding: 0.1)
})
```

But now the question is: how do we actually find the polynomial that goes through all the points? This is where Lagrange interpolation comes into play.

### Lagrange Interpolation

Let's take the following points $A_0 (0, 1)$, $A_1 (1, 3)$, $A_2 (2, 2)$ and $A_3 (3, 4)$ to demonstrate this method.

```typst
#set text(size: 10pt)

#canvas({
    import draw: *

    
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
        ),
    )

    plot.plot(
        name: "plot",
        size: (12, 8),
        axis-style: "school-book",
        x-tick-step: 1,
        y-tick-step: 1, 
        y-min: 0, 
        y-max: 5,
        x-min: 0,
        x-max: 5,
        x-grid: true,
        y-grid: true,
        legend: "inner-north-east",
        legend-style: (
            stroke: black,
            fill: none,
            radius: 5pt,
            padding: .5em,
        ),
        {
            plot.add-anchor("a_0", (0, 1))
            plot.add-anchor("a_1", (1, 3))
            plot.add-anchor("a_2", (2, 2))
            plot.add-anchor("a_3", (3, 4))
        }
    )

    circle("plot.a_0", radius: 0.1, fill: black, name :"a_0")
    content("a_0", [= $A_0$], anchor: "north-west", padding: 0.1)
    circle("plot.a_1", radius: 0.1, fill: black, name :"a_1")
    content("a_1", [= $A_1$], anchor: "north-west", padding: 0.1)
    circle("plot.a_2", radius: 0.1, fill: black, name :"a_2")
    content("a_2", [= $A_2$], anchor: "north-west", padding: 0.1)
    circle("plot.a_3", radius: 0.1, fill: black, name :"a_3")
    content("a_3", [= $A_3$], anchor: "north-west", padding: 0.1)
})
```

The main principle behind this is to split the function into multiple sub-functions $l_i (x)$, that each contribute to one given point, also called "node".

We want to construct $l_i (x)$ so that:

$$
l_i (x) = cases(
    space 1 "if" x = x_i,
    space 0 "if" x = x_j | j!=i
)
$$

Making a function equal to $0$ at a certain point $x_j$ is as simple as multiplying it by $(x - x_j)$. Based on this property, we can already "guess" $l_1^* (x)$:

$$
l_1^*(x) = (x - 0)(x - 2)(x - 3)
$$

```typst
#set text(size: 10pt)

#canvas({
    import draw: *

    
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
        ),
    )

    plot.plot(
        name: "plot",
        size: (12, 8),
        axis-style: "school-book",
        x-tick-step: 1,
        y-tick-step: 1, 
        y-min: -1, 
        y-max: 5,
        x-min: 0,
        x-max: 4,
        x-grid: true,
        y-grid: true,
        legend: "inner-north-west",
        legend-style: (
            stroke: black,
            fill: white,
            radius: 5pt,
            padding: .5em,
        ),
        {
            plot.add-anchor("a_0", (0, 1))
            plot.add-anchor("a_1", (1, 3))
            plot.add-anchor("a_2", (2, 2))
            plot.add-anchor("a_3", (3, 4))
            let l1(x) = (x - 0) * (x - 2) * (x - 3)
            plot.add(l1, domain: (0, 5), style: (stroke: blue + 2pt), label: $ l_1^* (x) $)
        }
    )

    circle("plot.a_0", radius: 0.1, fill: black, name :"a_0")
    content("a_0", [= $A_0$], anchor: "north-west", padding: 0.1)
    circle("plot.a_1", radius: 0.1, fill: black, name :"a_1")
    content("a_1", [= $A_1$], anchor: "north-west", padding: 0.1)
    circle("plot.a_2", radius: 0.1, fill: black, name :"a_2")
    content("a_2", [= $A_2$], anchor: "north-west", padding: 0.1)
    circle("plot.a_3", radius: 0.1, fill: black, name :"a_3")
    content("a_3", [= $A_3$], anchor: "north-west", padding: 0.1)
})
```

That's a good start! But we have a problem: $l_1^* (x)$ is not equal to $1$ at $x = 1$. We can fix this by dividing $l_1^* (x)$ by $l_1^* (1)$:

$$
l_1 (x) &= (l_1^* (x)) / (l_1^* (1)) \
        &= ((x - 0)(x - 2)(x - 3)) / ((1 - 0)(1 - 2)(1 - 3)) \
        &= ((x - 0)(x - 2)(x - 3)) / 2
$$

And we effectively have $l_1 (1) = 1$. We can now repeat this process for $l_0 (x)$, $l_2 (x)$ and $l_3 (x)$:

```typst
#import "@preview/cetz:0.3.1": *
#import "@preview/cetz-plot:0.1.0": plot, chart

#set text(size: 10pt)

#canvas({
    import draw: *

    
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
        ),
    )

    plot.plot(
        name: "plot",
        size: (12, 8),
        axis-style: "school-book",
        x-tick-step: 1,
        y-tick-step: 1, 
        y-min: -1, 
        y-max: 5,
        x-min: 0,
        x-max: 4,
        x-grid: true,
        y-grid: true,
        legend: "inner-north-east",
        legend-style: (
            stroke: black,
            fill: white,
            radius: 5pt,
            padding: .5em,
        ),
        {
            plot.add-anchor("a_0", (0, 1))
            plot.add-anchor("a_1", (1, 3))
            plot.add-anchor("a_2", (2, 2))
            plot.add-anchor("a_3", (3, 4))
            let l1(x) = (x - 0) * (x - 2) * (x - 3) / 2
            let l2(x) = (x - 0) * (x - 1) * (x - 3) / -2
            let l3(x) = (x - 0) * (x - 1) * (x - 2) / 6
            let l0(x) = (x - 1) * (x - 2) * (x - 3) / -6
            plot.add(l0, domain: (0, 5), style: (stroke: fuchsia + 2pt), label: $ l_0 (x) $)
            plot.add(l1, domain: (0, 5), style: (stroke: blue + 2pt), label: $ l_1 (x) $)
            plot.add(l2, domain: (0, 5), style: (stroke: green + 2pt), label: $ l_2 (x) $)
            plot.add(l3, domain: (0, 5), style: (stroke: red + 2pt), label: $ l_3 (x) $)
        }
    )

    circle("plot.a_0", radius: 0.1, fill: fuchsia, name :"a_0")
    content("a_0", [= $A_0$], anchor: "south-west", padding: 0.1)
    circle("plot.a_1", radius: 0.1, fill: blue, name :"a_1")
    content("a_1", [= $A_1$], anchor: "north-west", padding: 0.1)
    circle("plot.a_2", radius: 0.1, fill: green, name :"a_2")
    content("a_2", [= $A_2$], anchor: "north-west", padding: 0.1)
    circle("plot.a_3", radius: 0.1, fill: red, name :"a_3")
    content("a_3", [= $A_3$], anchor: "north-west", padding: 0.1)
})
```

The polynomial $P_3 (x)$ is computed by summing all the $l_i (x)$ together and multiplying them by the corresponding $y_i$:

$$
P_3 (x) &= y_0 l_0 (x) + y_1 l_1 (x) + y_2 l_2 (x) + y_3 l_3 (x) \
        &= 1 dot l_0 (x) + 3 dot l_1 (x) + 2 dot l_2 (x) + 4 dot l_3 (x)
$$

```typst
#import "@preview/cetz:0.3.1": *
#import "@preview/cetz-plot:0.1.0": plot, chart

#set text(size: 10pt)

#canvas({
    import draw: *

    
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
        ),
    )

    plot.plot(
        name: "plot",
        size: (12, 8),
        axis-style: "school-book",
        x-tick-step: 1,
        y-tick-step: 1, 
        y-min: -1, 
        y-max: 5,
        x-min: 0,
        x-max: 4,
        x-grid: true,
        y-grid: true,
        legend: "inner-north-west",
        legend-style: (
            stroke: black,
            fill: white,
            radius: 5pt,
            padding: .5em,
            spacing: .2
        ),
        {
            plot.add-anchor("a_0", (0, 1))
            plot.add-anchor("a_1", (1, 3))
            plot.add-anchor("a_2", (2, 2))
            plot.add-anchor("a_3", (3, 4))
            let l0(x) = ((x - 1) * (x - 2) * (x - 3) / -6) * 1
            let l1(x) = ((x - 0) * (x - 2) * (x - 3) / 2) * 3
            let l2(x) = ((x - 0) * (x - 1) * (x - 3) / -2) * 2
            let l3(x) = ((x - 0) * (x - 1) * (x - 2) / 6) * 4
            plot.add(l0, domain: (0, 5), style: (stroke: fuchsia + 2pt), label: $ l_0 (x) dot y_0 $)
            plot.add(l1, domain: (0, 5), style: (stroke: blue + 2pt), label: $ l_1 (x) dot y_1 $)
            plot.add(l2, domain: (0, 5), style: (stroke: green + 2pt), label: $ l_2 (x) dot y_2 $)
            plot.add(l3, domain: (0, 5), style: (stroke: red + 2pt), label: $ l_3 (x) dot y_3 $)
        }
    )

    circle("plot.a_0", radius: 0.1, fill: fuchsia, name :"a_0")
    content("a_0", [= $A_0$], anchor: "south-west", padding: 0.1)
    circle("plot.a_1", radius: 0.1, fill: blue, name :"a_1")
    content("a_1", [= $A_1$], anchor: "south-west", padding: 0.1)
    circle("plot.a_2", radius: 0.1, fill: green, name :"a_2")
    content("a_2", [= $A_2$], anchor: "north-west", padding: 0.1)
    circle("plot.a_3", radius: 0.1, fill: red, name :"a_3")
    content("a_3", [= $A_3$], anchor: "north-west", padding: 0.1)
})
```

And we have our polynomial $P_3 (x)$:

```typst
#set text(size: 10pt)

#canvas({
    import draw: *

    
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
        ),
    )

    plot.plot(
        name: "plot",
        size: (12, 8),
        axis-style: "school-book",
        x-tick-step: 1,
        y-tick-step: 1, 
        y-min: -1, 
        y-max: 5,
        x-min: 0,
        x-max: 4,
        x-grid: true,
        y-grid: true,
        legend: "inner-north-east",
        legend-style: (
            stroke: black,
            fill: none,
            radius: 5pt,
            padding: .5em,
        ),
        {
            plot.add-anchor("a_0", (0, 1))
            plot.add-anchor("a_1", (1, 3))
            plot.add-anchor("a_2", (2, 2))
            plot.add-anchor("a_3", (3, 4))
            let l0(x) = ((x - 1) * (x - 2) * (x - 3) / -6) * 1
            let l1(x) = ((x - 0) * (x - 2) * (x - 3) / 2) * 3
            let l2(x) = ((x - 0) * (x - 1) * (x - 3) / -2) * 2
            let l3(x) = ((x - 0) * (x - 1) * (x - 2) / 6) * 4
            let P3(x) = l0(x) + l1(x) + l2(x) + l3(x)
            plot.add(P3, domain: (0, 5), style: (stroke: blue + 2pt), label: $ P_3 (x) $)
        }
    )

    circle("plot.a_0", radius: 0.1, fill: black, name :"a_0")
    content("a_0", [= $A_0$], anchor: "north-west", padding: 0.1)
    circle("plot.a_1", radius: 0.1, fill: black, name :"a_1")
    content("a_1", [= $A_1$], anchor: "south-west", padding: 0.1)
    circle("plot.a_2", radius: 0.1, fill: black, name :"a_2")
    content("a_2", [= $A_2$], anchor: "north", padding: 0.25)
    circle("plot.a_3", radius: 0.1, fill: black, name :"a_3")
    content("a_3", [= $A_3$], anchor: "north-west", padding: 0.1)
})
```

Which effectively goes through $A_0$, $A_1$, $A_2$ and $A_3$.

## How Shamir's Secret Sharing Works

With the basics of polynomials and Lagrange interpolation in mind, let's dive in!

The main idea behind this is to split a secret $s$ into $n$ parts, such that any $k$ parts can be used to reconstruct the secret, but any $k-1$ parts are not enough to do so, and do not give any information about the secret.

> [!INFO]
> If you are not comfortable with the concept of Finite Fields, I recommend you to read some of the [resources](#references--suggested-readings) I listed at the end of this article.
>
> It is supposed that we are working in $FF_q$ when not specified.

### Splitting the Secret

Let's take the following example: we want to split the secret $s = 42$ into $n = 5$ parts, such that any $k = 3$ parts can be used to reconstruct the secret.

The first step is to sample a random polynomial $f(x) = P_(k-1) (x) = a_0 + a_1 x + ... + a_(k-1) x^(k-1)$ of degree $k-1$ such that $a_0 = s$. This gives us the property that $f(0) = s$.

$$
f(x) = P_2 (x) = 42 + 5 x + 3 x^2
$$

Our splits, also called shares, are in fact just points of our polynomial. We can generate them by evaluating $f(x)$ for $x in S = {1,2,3,4,5}$. Do **not** evaluate for $x = 0$ as this would obviously just give away the secret.

$$
z_1 &= f(1) = 42 + 5 + 3    &=& 50 \
z_2 &= f(2) = 42 + 10 + 12  &=& 64 \
z_3 &= f(3) = 42 + 15 + 27  &=& 84 \
z_4 &= f(4) = 42 + 20 + 48  &=& 110 \
z_5 &= f(5) = 42 + 25 + 75  &=& 142 \
$$

So our shares are $Z_1(1, 50)$, $Z_2(2, 64)$, $Z_3(3, 84)$, $Z_4(4, 110)$ and $Z_5(5, 142)$.

Let's now plot the polynomial $f(x)$:

```typst
#set text(size: 10pt)
#let f(x) = 42 + 5 * x + 3 * calc.pow(x, 2)

#canvas({
    import draw: *

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
        ),
    )

    plot.plot(
        name: "plot",
        size: (12, 8),
        axis-style: "school-book",
        x-tick-step: 1,
        y-tick-step: 50, 
        y-min: 0, 
        y-max: 200,
        legend: "inner-north-east",
        legend-style: (
            stroke: black,
            fill: none,
            radius: 5pt,
            padding: .5em,
        ),
    
        {
            let domain = (0, 6)
            plot.add(
                f, 
                domain: domain, 
                label: $ f(x)  $,
                style: (
                    stroke: blue + 2pt
                ),
                line: "spline",
            )
            plot.add-anchor("s_1", (1, 50))
            plot.add-anchor("s_2", (2, 64))
            plot.add-anchor("s_3", (3, 84))
            plot.add-anchor("s_4", (4, 110))
            plot.add-anchor("s_5", (5, 142))
        }
    )

    circle("plot.s_1", radius: 0.1, fill: black, name :"s_1")
    content("s_1", [= $S_1$], anchor: "north-west", padding: 0.1)
    circle("plot.s_2", radius: 0.1, fill: black, name :"s_2")
    content("s_2", [= $S_2$], anchor: "north-west", padding: 0.1)
    circle("plot.s_3", radius: 0.1, fill: black, name :"s_3")
    content("s_3", [= $S_3$], anchor: "north-west", padding: 0.1)
    circle("plot.s_4", radius: 0.1, fill: black, name :"s_4")
    content("s_4", [= $S_4$], anchor: "north-west", padding: 0.1)
    circle("plot.s_5", radius: 0.1, fill: black, name :"s_5")
    content("s_5", [= $S_5$], anchor: "north-west", padding: 0.1)
})
```

### Reconstructing the Secret

Based on what we just learnt earlier and Lagrange interpolation, we know that $n+1$ points $Z_i(x_i, y_i) | i in S$ will suffice to construct the polynonial $P_n(x)$ of degree $n$. 

In our case, $deg(f(x)) = k-1$, so we need $(k-1)+1 = k$ points to restore $f(x)$, just as described in the beginning.

Based on the shares we generated earlier, let's take $Z_1(1, 50)$, $Z_3(3, 84)$ and $Z_5(5, 142)$ to reconstruct the polynomial $f(x)$ using Lagrange interpolation:

```typst
#set text(size: 10pt)

#let l1(x) = ((x - 3) * (x - 5) / (1 - 3) / (1 - 5)) * 50
#let l3(x) = ((x - 1) * (x - 5) / (3 - 1) / (3 - 5)) * 84
#let l5(x) = ((x - 1) * (x - 3) / (5 - 1) / (5 - 3)) * 142
#let f(x) = l1(x) + l3(x) + l5(x)

#canvas({
    import draw: *

    
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
        ),
    )

    plot.plot(
        name: "plot",
        size: (12, 8),
        axis-style: "school-book",
        x-tick-step: 1,
        y-tick-step: 50, 
        y-min: -20, 
        y-max: 200,
        legend: "inner-north-west",
        legend-style: (
            stroke: black,
            fill: none,
            radius: 5pt,
            spacing: .25,
        ),
        {
            let domain = (0, 6)
            plot.add(
                f, 
                domain: domain, 
                label: $ f(x)  $,
                style: (
                    stroke: blue + 2pt
                ),
                line: "spline",
            )

            plot.add(
                l1, 
                domain: domain, 
                label: $ l_1 (x)  $,
                style: (
                    stroke: red + 1pt
                ),
                line: "spline",
            )
            plot.add(
                l3, 
                domain: domain, 
                label: $ l_3 (x)  $,
                style: (
                    stroke: green + 1pt
                ),
                line: "spline",
            )

            plot.add(
                l5, 
                domain: domain, 
                label: $ l_5 (x)  $,
                line: "spline",
            )
            
            plot.add-anchor("s_1", (1, 50))
            plot.add-anchor("s_3", (3, 84))
            plot.add-anchor("s_5", (5, 142))
        }
    )

    circle("plot.s_1", radius: 0.1, fill: black, name :"s_1")
    content("s_1", [= $S_1$], anchor: "north-west", padding: 0.1)
    circle("plot.s_3", radius: 0.1, fill: black, name :"s_3")
    content("s_3", [= $S_3$], anchor: "north-west", padding: 0.1)
    circle("plot.s_5", radius: 0.1, fill: black, name :"s_5")
    content("s_5", [= $S_5$], anchor: "north-west", padding: 0.1)

})
```

### Commitments, Proofs and Verifications

In a perfect world where everyone is honest and where there are no transmission errors caused by cosmic rays, we could just send the shares to the participants and call it a day. But guess what? [Sh*t happens](https://en.wikipedia.org/wiki/Murphy%27s_law).

We need a way to check that the share we receive as a shareholder after the secret has been split is actually a valid share. One could simply try to verify it by reconstructing the polynomial and checking if the secret is the same, but this clearly against the whole point of Shamir's Secret Sharing.

Instead, let's take advantage of the properties of elliptic curves to create a commitment scheme. After we have generated our polynomial $f(x)$, we can take each coefficient $a_i$ and multiply it by the generator point $G$ of the curve. This gives us a few values $C = {phi.alt_0, phi.alt_1, ..., phi.alt_(k-1)} | phi.alt_i = a_i dot G$ that we can send to the shareholders.

When a shareholder wants to verify their share $Z_i (i, f(i))$, they can check with the following equation:

$$
f(i) dot G &= sum_(j=0)^(k-1) (phi.alt_j dot i^j) \
          &= phi.alt_0 + phi.alt_1 i + phi.alt_2 i^2 + ... + phi.alt_(k-1) i^(k-1) \
          &= a_0 dot G + (a_1 dot G) i + (a_2 dot G) i^2 + ... + (a_(k-1) dot G) i^(k-1) \
          &= (a_0 + a_1 i + a_2 i^2 + ... + a_(k-1) i^(k-1)) dot G \
          &= sum_(j=0)^(k-1) (a_j i^j) dot G \
          &= underline(f(i) dot G)
$$

You could see this procedure as computing the "public keys" of the coefficients. This method is also called "Feldman's Verifiable Secret Sharing".

One may argue that disclosing $a_0 dot G = s dot G$ could give information about the polynomial, but if we suppose that $s$ is an EC secret key, the public key $s dot G$ is supposed public and may be shared. Finding $s$ with $s dot G$ comes down to solving the discrete logarithm problem, which is supposed really hard here. 

Another way the dealer could commit to the polynomial he generated without directly sharing $s dot G$, is to add a so-called "blinding polynomial", a pretty common concept in cryptography.

Let's now instead take $phi.alt_i = a_i dot G + b_i dot H$ where $b_i$ comes from a randomly generated polynomial $g(x) = b_0 + b_1 x + ... + b_(k-1) x^(k-1)$, our blinding polynomial. The dealer will now needs to distribute slightly different shares $Z_i (i, f(i), g(i))$.

Shareholders may now verify their shares with:

$$
f(i) dot G + g(i) dot H &= sum_(j=0)^(k-1) (phi.alt_j dot i^j) \ 
                        &= sum_(j=0)^(k-1) ((a_i dot G + b_i dot H) dot i^j) \
                        &= sum_(j=0)^(k-1) (a_j i^j) dot G + sum_(j=0)^(k-1) (b_j i^j) dot H \
                        &= underline(f(i) dot G + g(i) dot H )
$$

## Shared Secrets with Elliptic Curves

Sharing pre-defined secrets is cool, but what if we wanted to collectively generate one for $n$ people? Let's say we have our good old Alice, Bob and Charlie trying to communicate with each other securely. Alice doesn't trust Charlie to generate the secret locally and share it to everyone because he's the type of guy to write his passwords on sticky notes. Bob doesn't trust Alice either because her idea of a strong password is "password123" — used across five accounts.

In elliptic curves, we have the following property:

$$
(a dot G) dot b = (b dot G) dot a
$$

While this may just seem like simple associativity, it's actually pretty cool.

Let's say we have $n = 2$ participants, Alice and Bob, each with their key pair $(p_i, P_i)$, where $p_i$ is the private key and $P_i$ is the public key. We can generate a shared secret $S$ by leveraging the property above:

1. Alice generates a random scalar $p_a$, her private key and sends $P_a = p_a dot G$ to Bob.
2. Bob also generates $p_b$ and sends back $P_b = p_b dot G$ to Alice.
3. Alice computes $S = p_a dot P_b = p_a dot (p_b dot G)$.
4. Bob computes $S = p_b dot P_a = p_b dot (p_a dot G)$.

You can see that both Alice and Bob end up with the same shared secret $S$ without ever having to share their private keys.

This process can also be extended to $n$ participants, let's take $n = 3$ with Alice, Bob and Charlie here for simplicity:

1. Alice, Bob and Charlie generate their private keys $p_a$, $p_b$ and $p_c$ respectively.
2. They compute their public keys $P_a = p_a dot G$, $P_b = p_b dot G$ and $P_c = p_c dot G$ and share them with each other.
3. Alice computes $P_(b a) = P_a dot p_b = (p_a dot p_b) dot G$, $P_(c a) = P_a dot p_c = (p_a dot p_c) dot G$ and sends them to Charlie and Bob respectively.
4. Bob computes $P_(c b) = P_b dot p_c = (p_b dot p_c) dot G$ and sends it to Alice, he can already compute $S = P_(c a) dot p_b = (p_a dot p_c dot p_b) dot G$.
5. Charlie computes $S = P_(b a) dot p_c = (p_a dot p_b dot p_c) dot G$.
6. Alice computes $S = P_(c b) dot p_a = (p_b dot p_c dot p_a) dot G$

And voilà! All participants now have the same shared secret $S$. I'll let figuring out the general case for $n$ participants as an exercise to the reader (not because I'm lazy, I swear).

This secret can now be used as a symmetric key for encryption, a seed for a PRNG, etc.

## ECDSA Signatures

Elliptic curves can't make you a sandwich, but they can also be used to sign messages! Let's take a look at the Elliptic Curve Digital Signature Algorithm (ECDSA). Our goal is to output a signature $(r, s)$ for a given message $m$, so that the recipient can verify that the sender is authentic. The sender's keys are $(p, P)$, with $p$ the private key, and $P$ the public one.

1. Compute the hash $h = H(m)$ where $H(x)$ is any cryptographic hash function (e.g. SHA-256).
2. Generate a random $k$ number in in the current subgroup.
3. Calculate the associated random point on the curve $K = k dot G$, with $G$ a generator, with $x_K$ the $x$-coordinate of this point.
4. Calculate the signature $s = k^(-1) dot (h + x_K dot p)$, where $k^(-1)$ is the modular inverse of $k$.

By sending $(r, s)$, you confirm you know:

- The content of the message $m$
- The private key $p$ associated to $P = p dot G$

The verifier may follow this procedure to check if the message $m$ that he received along with $(r,s)$ is authentic:

1. Compute the hash $h = H(m)$ with the same cryptographic hash function defined before.
2. Calculate the modular inverse of $s$: $S = s^(-1)$
3. Recover the random point used in the signature process: $K = h S dot G + r S dot P$
4. Check whether $x_K = r$, if so, then the message is authentic.

To prove this works, let's start with the definition of the signature $s$:

$$
    & s = k^(-1) dot (h + x_K dot p) \
<==>& s dot k = h + x_K dot p \
<==>& underbrace(s dot k = h + r dot p, (a))
$$

Incorporate $(a)$ into $K$:

$$
K &= h S dot G + r S dot P \
  &= h s^(-1) dot G + r s^(-1) dot (p dot G) \
  &= s^(-1) (h dot G + r dot (p dot G)) \
  &= s^(-1) underbrace((h + r dot p), (a)) dot G \
  &= underbrace(s^(-1) s, = 1) dot k dot G \
  &= underline(k dot G)
$$

Which is just our definition of $K$ when generating the signature.

### Kool Kids Public Key Recovery

Let's suppose you are talking through a [Tin can telephone](https://en.wikipedia.org/wiki/Tin_can_telephone) with your friend and every byte you send matters. You don't want to send the public key $P$ along with the signature $(r, s)$ because that's just too much data. Instead, you can recover the public key from the signature and the message.

Given $x_K$, there are typically **two** candidate points $K'_i$ that fit. And since we know that $K = h S dot G + r S dot P$, which we just verified works, it can be rearranged to isolate the public key $P$:

$$
    K'_i &= h S dot G + r S dot P_i \
<==> P_i &= s^(-1)(r K'_i - h G)
$$

To choose which one is the correct one, we need to verify the signature with each $P_i$:

$$
K_i = h S dot G + r S dot P_i = (x_K, y_K) \
x_K =^? r
$$

This ambiguity is often removed by adding a single bit $b in {0,1}$ into the signature message: $(r, s, b)$

## Schnorr Signatures

Schnorr signatures are a bit like ECDSA, but faster and simpler. We are going to use the same keys $(p, P)$ as before, with $p$ the private key and $P$ the public one. We'll first see the procedure and then discuss the mathematical proof of why this works.

1. Sample a random nonce $r <- ZZ_n$

<details>
<summary> What the hell is <code class="language-math math-inline">ZZ_n</code>?</summary>

The set $ZZ_n$ is the cyclic group of integers, isomorphic to the quotient group $ZZ slash n ZZ$. It is basically just the set of integers modulo $n$.

$$
ZZ_n = {0, 1, 2, ..., n-1}
$$

In our case, $n$ is the order (how many points are in) of the subgroup generated by $G$.
If the curve's cofactor $h$ is 1, then $n$ is the order of the curve. If $h$ is not 1, the order is $n/h = "ord"(G)$.
</details>

1. Multiply it by the generator: $R = r G$
2. We can now compute the challenge $e = H(R || P || m)$
3. And the signature: $s = r + e p$

The final signature is $(R, s)$.

Once the signature has been emitted, verifying it is as easy as multiplying both sides of the signature equation by $G$:

$$
s dot G &= (r + e p) dot G \
        &= R + e P
$$

To know $e$, the verifier needs to know the message $m$, the public key $P$. In some cases, you might not need to include the public key into the challenge and simply hash $e = H(R || m)$.

### Why it Works

There isn't really a proof needed for the verifying step as it's just factoring out $G$ again, but here you are:

$$
    & s dot G = R + e P \
<==>& s dot G = underbrace(r G, R) + h underbrace(p G, P) \
<==>& s dot G = (r + e p) dot G \
$$

One trickier part is to explain why we are adding a random nonce $r$ to both the signature and the challenge. This value **has** to be sampled randomly and **must not** be reused. If it is, the private key can be recovered. Let's first take the case where no $r$ is used:

$$
    & s = e p \
<==>& p = s^(-1) e
$$

Recovering the private key is as simple as multiplying the challenge $e$ by the modular inverse of $s$. Not good.

Now, let's take the case where $r$ is reused, with two messages $m_1$ and $m_2$, along with their respective signatures $(R, s_1)$ and $(R, s_2)$:

$$
cases(
    space s_1 = r + e_1 p <==> r = (s_1 - e_1 p) space script((a)),
    space s_2 = r + e_2 p <==> r = (s_2 - e_2 p) space script((b))
)
$$

Combining $(a)$ and $(b)$:

$$
    & r = (s_1 - e_1 p) = (s_2 - e_2 p) \
<==>& e_1 p - e_2 p = s_1 - s_2 \
<==>& p dot (e_1 - e_2) = s_1 - s_2 \
<==>& p = (s_1 - s_2) / (e_1 - e_2)
$$

You may see $r$ as an additional unknown variable that is used to prevent the linear equation system from being solved, because for $n$ messages, you have $n$ equations and $n+1$ unknowns, which is unsolvable in our case. 

### Aggregating Signatures

Schnorr signatures have the nice property that they can be aggregated, this means that a group of people can sign a message $m$ together and the signature can be verified as if it was signed by a single person. Let's consider our signing group $S = {a,b,c}$ for Alice, Bob and Charlie respectively.

$$
&underline("Alice") &&underline("Bob") &&underline("Charlie") \
&R_a = r_a dot G quad  &&R_b = r_b dot G quad &&R_c = r_c dot G \
$$

The aggregated nonce is simply the sum of all nonces:

$$
R &= sum_(i in S) R_i \
  &= R_a + R_b + R_c \
  &= (r_a + r_b + r_c) dot G
$$

Likewise for the public key:

$$
P &= sum_(i in S) P_i \
  &= P_a + P_b + P_c \
  &= (p_a + p_b + p_c) dot G
$$

Each of them computes the challenge $e$ along with the final signature $s_i$ with the parameters just agreed upon:

$$
e = H(R || P || m) \
s_i = e p_i + r_i
$$

Aggregate again:

$$
s = sum_(i in S) s_i
$$

The final signature that can be sent to others is $(R, s)$.

Because we are just adding signatures parts together, we can group the nonces and the private keys in our final signature:

$$
s &= sum_(i in S) s_i \
  &= sum_(i in S) (e p_i + r_i) \
  &= e p_a + r_a + e p_b + r_b + e p_c + r_c \
  &= underbrace(r_a + r_b + r_c, "Nonces") + e underbrace((p_a + p_b + p_c), "Private Keys") \
  &= sum_(i in S) r_i + e dot sum_(i in S) p_i
$$

In the verifying step, multiplying each side by $G$:

$$
s G &= sum_(i in S) r_i dot G + e dot sum_(i in S) p_i dot G \
    &= sum_(i in S) R_i + e dot sum_(i in S) P_i \
    &= R + e P
$$

### But wait!

At no point in this procedure, we ever check if the nonces or the public keys provided are honest. What if Charlie provided a malicious key $P^*_c$ in the sharing step ? Because everyone doesn't send their public key at the exact same time, Carol could wait for everyone to send theirs, and compute:

$$
P^*_c = P_c - P_a - P_b \
$$

The aggregated key will look like:

$$
P &= sum_(i in S) P_i \
  &= P_a + P_b + P^*_c \
  &= P_a + P_b + (P_c - P_a - P_b) \
  &= P_c
$$

Carol just wiped everyone else from the signing key, and is now in full control of the signature. How can we prevent that ?

### Multi-Signatures, don't trust, verify

The most common way to prevent this is to force everyone to provide a proof that their public key is honest. This is done by providing a Proof of Knowledge for the private key, proving that they know the private key associated to the public key they provided.

Let's take the case of a prover Patricia and a verifier Victor. Patricia wants to prove that she knows the private key $p$ associated to the public key $P = p dot G$. The proof is done in four steps:

1. Patricia samples $r <- ZZ_n$ at random and sends $R = r dot G$ to Victor.
2. Victor sends a challenge $c <- ZZ_n$ to Patricia.
3. Patricia computes $z = r + c p$ and sends it to Victor.
4. Victor verifies that $z dot G = R + c P$.

This works because:

$$
z       &= r + c p \
z dot G &= (r + c p) dot G \
        &= r dot G + c p dot G \
        &= R + c P
$$

But what if Patricia doesn't know the associated private key but still wants to prove that her key is honest ? Remember commitment schemes ? We can use them here. In our case, every participant will commit to their public key before disclosing it. Think of it as putting your public key in a box, sealing it and waiting for everyone to do the same before opening it. Let's get back to our group $S = {a,b,c}$:

1. Each participant $i$ hashes their public key $P_i$ and sends $H(P_i)$ to everyone.
2. Once everyone has sent their hash, they disclose their public key $P_i$.
3. Everyone verifies that the hash they received matches the public key.
4. The signing process continues as usual.

This way, everyone can be sure that the public keys are honest and that no one is trying to pull a fast one.

### There's more!

Random nonces are also aggregated, and at no point we are verifying that they are authentic. The exploit method is a bit trickier, I recommend you to read [this article](https://conduition.io/cryptography/wagner/) by conduition on the subject if you want to know the details.

## Rust Implementation

I've been using Rust for a while now (_even though I feel like I'm a complete beginner and still can't manage to fully understand lifetimes_), so I thought it would be a good idea to implement Shamir's Secret Sharing in Rust.

> [!WARNING]
> **Disclaimer**: Be aware that this is not suited for production use. Consider using a battle-tested cryptography instead.

### Dependencies

Because working with elliptic curves is a bit tricky, we'll use [`bls12_381_plus`](https://lib.rs/bls12_381_plus), which is a Rust implementation of the [BLS12-381](https://hackmd.io/@benjaminion/bls12-381) curve. This abstracts a lot of the complexity and allows us to focus on the actual implementation of the algorithm. 

```typst
#set text(size: 10pt)

#canvas({
    import draw: *

    
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
        ),
    )

    plot.plot(
        name: "plot",
        size: (12, 8),
        axis-style: "school-book",
        x-tick-step: 3,
        y-tick-step: 2, 
        legend: "inner-north-east",
        legend-style: (
            stroke: black,
            fill: none,
            radius: 5pt,
            padding: .5em,
        ),
    
        {
            add-contour(
                x-domain: (-6, 6),
                y-domain: (-5, 5),
                op: "<",
                z: 0,
                x-samples: 50,
                y-samples: 50,
                style: (
                    stroke: blue + 2pt
                ),
                label: $ space y^2 = x^3 + 4 $,
                (x, y) => y * y - (x * x * x + 4)
            )
        }
    )
})
```

<figcaption>Representation of the BLS12-381 curve</figcaption>

You could also have used any other elliptic curve, such as [Secp256k1](https://en.bitcoin.it/wiki/Secp256k1).

<details>

<summary>
Little side note on the Secp256k1 curve
</summary>

Secp256k1, popular in cryptocurrencies like Bitcoin, is chosen not only for its efficiency but for its simplicity and transparency—qualities that help to prevent hidden vulnerabilities. 

A cautionary tale here is the [Dual_EC_DRBG scandal](https://blog.cloudflare.com/how-the-nsa-may-have-put-a-backdoor-in-rsas-cryptography-a-technical-primer/), where it was discovered that a backdoor had likely been embedded into a cryptographic algorithm, making it insecure for sensitive use. 
Secp256k1’s constants were selected in a predictable way, which significantly reduces the possibility that the curve's creator inserted any sort of backdoor into the curve.

The curve is defined by the equation $y^2 = x^3 + 7$, represented below, even though in reality it just looks like a bunch of points scattered around because it is taken over a finite field $FF_q | q = 2^256 - 2^32 - 2^9 - 2^8 - 2^7 - 2^6 - 2^4 - 1$ (yes, $q$ is prime, I know, it's weird).

```typst
#set text(size: 10pt)

#canvas({
    import draw: *

    
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
        ),
    )

    plot.plot(
        name: "plot",
        size: (12, 8),
        axis-style: "school-book",
        x-tick-step: 3,
        y-tick-step: 2, 
        legend: "inner-north-east",
        legend-style: (
            stroke: black,
            fill: none,
            radius: 5pt,
            padding: .5em,
        ),
    
        {
            add-contour(
                x-domain: (-6, 6),
                y-domain: (-5, 5),
                op: "<",
                z: 0,
                x-samples: 50,
                y-samples: 50,
                style: (
                    stroke: blue + 2pt
                ),
                label: $ space y^2 = x^3 + 7 $,
                (x, y) => y * y - (x * x * x + 7)
            )
        }
    )
})

```
<figcaption>Representation of the Secp256k1 curve</figcaption>
</details>

I also made my own `Polynomial{:rs}` struct to handle the polynomial operations, such as addition, multiplication, evaluation, etc.

<details>

<summary><code>polynomial.rs</code></summary>

```rust copy
use crate::types::{Point, Scalar, GENERATOR, GENERATOR_BLINDING};
use elliptic_curve::Field;
use std::ops::Mul;
/// Helper struct to represent a polynomial and evaluate it
#[derive(Clone, Debug)]
pub struct Polynomial {
    pub coefficients: Vec<Scalar>,
}

impl Polynomial {
    pub fn evaluate(&self, x: Scalar) -> Scalar {
        if self.coefficients.is_empty() {
            return Scalar::ZERO;
        }
        let degree = self.coefficients.len() - 1;
        let mut out = self.coefficients[degree];
        for i in (0..degree).rev() {
            out *= x;
            out += self.coefficients[i];
        }
        out
    }

    pub fn random<D>(degree: D) -> Self
    where
        D: Into<usize>,
    {
        let mut rng = rand::thread_rng();
        let mut coefficients = vec![];
        for _ in 0..=degree.into() {
            coefficients.push(Scalar::random(&mut rng));
        }
        Self { coefficients }
    }

    pub fn fill<U>(&mut self, degree: U)
    where
        U: Into<usize>,
    {
        let mut rng = rand::thread_rng();
        for _ in self.coefficients.len()..=degree.into() {
            self.coefficients.push(Scalar::random(&mut rng));
        }
    }

    pub fn with_fill<U>(mut self, degree: U) -> Self
    where
        U: Into<usize>,
    {
        self.fill(degree);
        self
    }

    pub fn commit(&self) -> Vec<Point> {
        self.coefficients.iter().map(|e| GENERATOR * e).collect()
    }

    pub fn zip_commit(&self, other: &Self) -> Vec<Point> {
        self.coefficients
            .iter()
            .zip(other.coefficients.clone())
            .map(|(a, b)| a * GENERATOR + b * *GENERATOR_BLINDING)
            .collect()
    }

    /// Add a root at c by multiplying the polynomial by (x - c)
    pub fn add_root(&mut self, c: Scalar) {
        *self *= Polynomial::new(vec![c, -Scalar::ONE]);
    }

    pub fn with_root(mut self, c: Scalar) -> Self {
        self.add_root(c);
        self
    }

    pub fn new(coefficients: Vec<Scalar>) -> Self {
        Self { coefficients }
    }

    pub fn empty() -> Self {
        Self {
            coefficients: vec![],
        }
    }

    pub fn degree(&self) -> usize {
        if self.coefficients.is_empty() {
            return 0;
        }
        self.coefficients.len() - 1
    }

    pub fn lagrange(points: Vec<(Scalar, Scalar)>) -> Self {
        if points.is_empty() {
            return Self {
                coefficients: vec![],
            };
        }

        let degree = points.len() - 1;
        let mut result = vec![Scalar::ZERO; degree + 1];

        // For each point, calculate its contribution to the final polynomial
        for (i, (x_i, y_i)) in points.iter().enumerate() {
            let mut basis_poly = vec![Scalar::ONE]; 

            for (j, (x_j, _)) in points.iter().enumerate() {
                if i != j {
                    let mut new_coeffs = vec![Scalar::ZERO];
                    new_coeffs.extend(basis_poly.iter().cloned());

                    // Subtract x_j times each coefficient
                    for (k, coeff) in basis_poly.iter().enumerate() {
                        new_coeffs[k] -= *x_j * *coeff;
                    }

                    basis_poly = new_coeffs;
                }
            }

            // Calculate denominator: product of (x_i - x_j) for all j != i
            let mut denominator = Scalar::ONE;
            for (j, (x_j, _)) in points.iter().enumerate() {
                if i != j {
                    denominator *= *x_i - *x_j;
                }
            }

            // Multiply basis polynomial by y_i/denominator
            let coefficient = *y_i * denominator.invert().unwrap();
            for coeff in basis_poly.iter_mut() {
                *coeff *= coefficient;
            }

            for (k, coeff) in basis_poly.iter().enumerate() {
                result[k] += *coeff;
            }
        }

        Self {
            coefficients: result,
        }
    }
}

impl PartialEq for Polynomial {
    fn eq(&self, other: &Self) -> bool {
        self.coefficients == other.coefficients
    }
}

impl Mul<Scalar> for Polynomial {
    type Output = Self;

    fn mul(self, rhs: Scalar) -> Self::Output {
        let mut coefficients = vec![];
        for c in self.coefficients {
            coefficients.push(c * rhs);
        }
        Self { coefficients }
    }
}

impl Mul<Polynomial> for Polynomial {
    type Output = Self;

    fn mul(self, rhs: Polynomial) -> Self::Output {
        let mut coefficients = vec![Scalar::ZERO; self.degree() + rhs.degree() + 1];
        for i in 0..=self.degree() {
            for j in 0..=rhs.degree() {
                coefficients[i + j] += self.coefficients[i] * rhs.coefficients[j];
            }
        }
        Self { coefficients }
    }
}

impl std::ops::MulAssign<Scalar> for Polynomial {
    fn mul_assign(&mut self, rhs: Scalar) {
        for c in self.coefficients.iter_mut() {
            *c *= rhs;
        }
    }
}

impl std::ops::MulAssign<Polynomial> for Polynomial {
    fn mul_assign(&mut self, rhs: Polynomial) {
        if self.coefficients.is_empty() {
            return;
        }
        if rhs.coefficients.is_empty() {
            self.coefficients = vec![];
            return;
        }
        let mut coefficients = vec![Scalar::ZERO; self.degree() + rhs.degree() + 1];
        for i in 0..=self.degree() {
            for j in 0..=rhs.degree() {
                coefficients[i + j] += self.coefficients[i] * rhs.coefficients[j];
            }
        }
        self.coefficients = coefficients;
    }
}

impl std::ops::Add for Polynomial {
    type Output = Self;

    fn add(self, rhs: Self) -> Self::Output {
        let mut coefficients = vec![];
        let mut i = 0;
        let mut j = 0;
        while i < self.coefficients.len() && j < rhs.coefficients.len() {
            coefficients.push(self.coefficients[i] + rhs.coefficients[j]);
            i += 1;
            j += 1;
        }
        while i < self.coefficients.len() {
            coefficients.push(self.coefficients[i]);
            i += 1;
        }
        while j < rhs.coefficients.len() {
            coefficients.push(rhs.coefficients[j]);
            j += 1;
        }
        Self { coefficients }
    }
}

impl std::ops::AddAssign for Polynomial {
    fn add_assign(&mut self, rhs: Self) {
        let mut coefficients = vec![];
        let mut i = 0;
        let mut j = 0;
        while i < self.coefficients.len() && j < rhs.coefficients.len() {
            coefficients.push(self.coefficients[i] + rhs.coefficients[j]);
            i += 1;
            j += 1;
        }
        while i < self.coefficients.len() {
            coefficients.push(self.coefficients[i]);
            i += 1;
        }
        while j < rhs.coefficients.len() {
            coefficients.push(rhs.coefficients[j]);
            j += 1;
        }
        self.coefficients = coefficients;
    }
}

impl std::ops::SubAssign for Polynomial {
    fn sub_assign(&mut self, rhs: Self) {
        // Add the negation of the second polynomial
        *self += rhs * Scalar::ONE.neg();
    }
}

impl std::ops::AddAssign<&Polynomial> for Polynomial {
    fn add_assign(&mut self, rhs: &Self) {
        let mut coefficients = vec![];
        let mut i = 0;
        let mut j = 0;
        while i < self.coefficients.len() && j < rhs.coefficients.len() {
            coefficients.push(self.coefficients[i] + rhs.coefficients[j]);
            i += 1;
            j += 1;
        }
        while i < self.coefficients.len() {
            coefficients.push(self.coefficients[i]);
            i += 1;
        }
        while j < rhs.coefficients.len() {
            coefficients.push(rhs.coefficients[j]);
            j += 1;
        }
        self.coefficients = coefficients;
    }
}

impl std::ops::Sub for Polynomial {
    type Output = Self;

    fn sub(self, rhs: Self) -> Self::Output {
        // Add the negation of the second polynomial
        self + rhs * Scalar::ONE.neg()
    }
}
```
</details>



<details>

<summary><code>types.rs</code></summary>

```rust copy
use bls12_381_plus::{G1Projective, Scalar as BLSScalar};
use elliptic_curve::hash2curve::ExpandMsgXmd;
use lazy_static::lazy_static;

pub type Scalar = BLSScalar;
/// A share of a secret
pub type Share = (Scalar, Scalar); // (i, f(i))
pub type PedersenShare = (Scalar, Scalar, Scalar); // (i, f(i), g(i))

/// Wrapper type for a commitment
pub type Point = G1Projective;

pub const GENERATOR: Point = G1Projective::GENERATOR;
```
</details>

Let's get to the code!

### Splitting the Secret

```rust copy
/// Split a secret into n shares, requiring k shares to recover the secret
pub fn split(s: Scalar, n: u8, k: u8) -> Result<Vec<Share>> {
    ensure!(k <= n, "Cannot require (k = {k}) > (n = {n})");

    // Random polynomial: secret + a_1 * x^1 + ... + a_(k-1) * x^(k-1)
    let mut poly = Polynomial::new(vec![s])
        .with_fill(k - 1);
    // Compute our n shares
    let shares = (1..=n)
        .map(|i| {
            let x = Scalar::from(i as u32);
            (x, poly.evaluate(x))
        })
        .collect();

    Ok(shares)
}
```

### Verifying the Shares - Feldman's VSS

```rust copy
/// Verify a share against a set of commitments
pub fn verify(share: Share, commitments: Vec<Point>) -> Result<()> {
    // We need to check that share_i * G = sum_(j=0)^(t-1) i^j * commitment_j
    let mut lhs = Point::identity();
    let rhs = GENERATOR * share.1;
    for (j, commitment) in commitments.iter().enumerate() {
        lhs += commitment * share.0.pow_vartime(&Scalar::from(j as u8).to_raw());
    }

    ensure!(
        bool::from((lhs - rhs).is_identity()),
        "Verification failed: {:#?} != {:#?}",
        lhs,
        rhs
    );
    Ok(())
}
```

### Verifying the Shares - Pedersen's VSS

```rust copy
lazy_static! {
    // We need a 2nd generator point - just hash a random message
    static ref GENERATOR_BLINDING: Point = G1Projective::hash::<ExpandMsgXmd<Sha256>>(
        b"generator_blinding",
        &[0xde, 0xad, 0xbe, 0xef]
    );
}

/// Verify a share against a set of Pedersen commitments
pub fn verify(share: PedersenShare, commitments: Vec<Point>) -> Result<()> {
    // We need to check that f(i) * G + g(i) * H = sum_(j=0)^(t-1) i^j * commitment_j
    let mut lhs = Point::identity();
    let rhs = share.1 * GENERATOR + share.2 * *GENERATOR_BLINDING;
    for (j, commitment) in commitments.iter().enumerate() {
        lhs += commitment * share.0.pow_vartime(&Scalar::from(j as u8).to_raw());
    }

    ensure!(
        bool::from((lhs - rhs).is_identity()),
        "Verification failed: {:#?} != {:#?}",
        lhs,
        rhs
    );
    Ok(())
}
```

## References / Suggested readings

- **Issuing New Shamir Secret Shares Using Multi-Party Computation**  
    [conduition.io](https://conduition.io/cryptography/shamir/)

- **A Dive Into the Math Behind Bitcoin Schnorr Signatures**  
    [conduition.io](https://conduition.io/cryptography/schnorr/)

- **A (Relatively Easy To Understand) Primer on Elliptic Curve Cryptography**  
    Nick Sullivan  
    [cloudflare.com](https://blog.cloudflare.com/a-relatively-easy-to-understand-primer-on-elliptic-curve-cryptography/)

- **Feldman’s Verifiable Secret Sharing for a Dishonest Majority**  
    Yi-Hsiu Chen and Yehuda Lindell  
    [eprint.iacr.org](https://eprint.iacr.org/2024/031.pdf)

- **Adaptively Secure Feldman VSS and Applications to Universally-Composable Threshold Cryptography**  
    Masayuki Abe and Serge Fehr  
    [eprint.iacr.org](https://eprint.iacr.org/2004/119.pdf)

- **Asymmetric Key Ciphers**  
    Svetlin Nakov  
    [cryptobook.nakov.com](https://cryptobook.nakov.com/asymmetric-key-ciphers)
