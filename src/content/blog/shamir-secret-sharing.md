---
title: Shamir's Secret Sharing Inner workings
tags: [cryptography, maths]
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

One of the most, if not *the* most important property of polynomials, is that each one of them can uniquely be described by $n+1$ points for a polynomial of degree $n$, noted $P_n (x)$.

The most straightfoward way of seeing this is by setting an equation for each point $A_i (x_i, y_i)$ we have:
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
#import "@preview/cetz:0.3.1": *
#import "@preview/cetz-plot:0.1.0": plot, chart

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
#import "@preview/cetz:0.3.1": *
#import "@preview/cetz-plot:0.1.0": plot, chart

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
            plot.add(f, domain: (-5, 5), style: (stroke: rgb(100, 100, 255, 200) + 2pt))
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

A line is essentially just $f(x) = a x + b$, which is of degree $1$. We can guess and deduce we need at least $n$ points to describe a polynomial $P_(n-1)$.

The same goes if we add a third point $A_2 (0, 4)$:

```typst
#import "@preview/cetz:0.3.1": *
#import "@preview/cetz-plot:0.1.0": plot, chart

#set text(size: 10pt)
#let f(x) = -(11/6) * calc.pow(x, 2) - x/6 + 4;

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
            plot.add(f, domain: (-5, 5), style: (stroke: rgb(100, 100, 255, 200) + 2pt))
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
#import "@preview/cetz:0.3.1": *
#import "@preview/cetz-plot:0.1.0": plot, chart

#set text(size: 10pt)
#let f(x, b) = ((3 * b - 5) / 3) * calc.pow(x, 2) + b * x + ((11 - 6 * b) / 3)
#let f1(x) = f(x, 1)
#let f2(x) = f(x, 2)
#let f3(x) = f(x, 3)


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
            plot.add(f1, domain: (-5, 5), style: (stroke: rgb(100, 100, 255, 200) + 2pt))
            plot.add(f2, domain: (-5, 5), style: (stroke: rgb(100, 255, 100, 200) + 2pt))
            plot.add(f3, domain: (-5, 5), style: (stroke: rgb(255, 100, 100, 200) + 2pt))
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

But now the question is: how do we actually find the polynomial that goes through all the points? This is where Lagrange interpolation comes into play.

### Lagrange Interpolation

Let's take the following points $A_0 (0, 1)$, $A_1 (1, 3)$, $A_2 (2, 2)$ and $A_3 (3, 4)$ to demonstrate this method.

```typst
#import "@preview/cetz:0.3.1": *
#import "@preview/cetz-plot:0.1.0": plot, chart

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
l_i(x) = cases(
    space 1 "if" x = x_i,
    space 0 "if" x != x_j | j!=i
)
$$

Making a function equal to $0$ at a certain point $x_i$ is as simple as multiplying it by $(x - x_i)$. Based on this property, we can already "guess" $l_1^* (x)$:

$$
l_1^*(x) = (x - 0)(x - 2)(x - 3)
$$

```typst
#import "@preview/cetz:0.3.1": *
#import "@preview/cetz-plot:0.1.0": plot, chart

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
            plot.add(l1, domain: (0, 5), style: (stroke: rgb(100, 100, 255, 200) + 2pt), label: $ l_1^* (x) $)
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
            plot.add(l0, domain: (0, 5), style: (stroke: rgb(255, 100, 255, 200) + 2pt), label: $ l_0 (x) $)
            plot.add(l1, domain: (0, 5), style: (stroke: rgb(100, 100, 255, 200) + 2pt), label: $ l_1 (x) $)
            plot.add(l2, domain: (0, 5), style: (stroke: rgb(100, 255, 100, 200) + 2pt), label: $ l_2 (x) $)
            plot.add(l3, domain: (0, 5), style: (stroke: rgb(255, 100, 100, 200) + 2pt), label: $ l_3 (x) $)
        }
    )

    circle("plot.a_0", radius: 0.1, fill: rgb(255, 100, 255, 200), name :"a_0")
    content("a_0", [= $A_0$], anchor: "south-west", padding: 0.1)
    circle("plot.a_1", radius: 0.1, fill: rgb(100, 100, 255, 200), name :"a_1")
    content("a_1", [= $A_1$], anchor: "north-west", padding: 0.1)
    circle("plot.a_2", radius: 0.1, fill: rgb(100, 255, 100, 200), name :"a_2")
    content("a_2", [= $A_2$], anchor: "north-west", padding: 0.1)
    circle("plot.a_3", radius: 0.1, fill: rgb(255, 100, 100, 200), name :"a_3")
    content("a_3", [= $A_3$], anchor: "north-west", padding: 0.1)
})
```

We can now construct the polynomial $P_3 (x)$ by summing all the $l_i (x)$ together and multiplying them by the corresponding $y_i$:

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
            plot.add(l0, domain: (0, 5), style: (stroke: rgb(255, 100, 255, 200) + 2pt), label: $ l_0 (x) dot y_0 $)
            plot.add(l1, domain: (0, 5), style: (stroke: rgb(100, 100, 255, 200) + 2pt), label: $ l_1 (x) dot y_1 $)
            plot.add(l2, domain: (0, 5), style: (stroke: rgb(100, 255, 100, 200) + 2pt), label: $ l_2 (x) dot y_2 $)
            plot.add(l3, domain: (0, 5), style: (stroke: rgb(255, 100, 100, 200) + 2pt), label: $ l_3 (x) dot y_3 $)
        }
    )

    circle("plot.a_0", radius: 0.1, fill: rgb(255, 100, 255, 200), name :"a_0")
    content("a_0", [= $A_0$], anchor: "south-west", padding: 0.1)
    circle("plot.a_1", radius: 0.1, fill: rgb(100, 100, 255, 200), name :"a_1")
    content("a_1", [= $A_1$], anchor: "south-west", padding: 0.1)
    circle("plot.a_2", radius: 0.1, fill: rgb(100, 255, 100, 200), name :"a_2")
    content("a_2", [= $A_2$], anchor: "north-west", padding: 0.1)
    circle("plot.a_3", radius: 0.1, fill: rgb(255, 100, 100, 200), name :"a_3")
    content("a_3", [= $A_3$], anchor: "north-west", padding: 0.1)
})
```

And we have our polynomial $P_3 (x)$:

```typst
#import "@preview/cetz:0.3.1": *
#import "@preview/cetz-plot:0.1.0": plot, chart

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
            plot.add(P3, domain: (0, 5), style: (stroke: rgb(100, 150, 150, 200) + 2pt), label: $ P_3 (x) $)
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

Which effectively goes through $A_0$, $A_1$, $A_2$ and $A_3$.

## How Shamir's Secret Sharing Works

With the basics of polynomials and Lagrange interpolation in mind, we can now dive into Shamir's Secret Sharing. 

The main idea behind this is to split a secret $s$ into $n$ parts, such that any $k$ parts can be used to reconstruct the secret, but any $k-1$ parts are not enough to do so, and do not give any information about the secret.

### Splitting the Secret

Let's take the following example: we want to split the secret $s = 42$ into $n = 5$ parts, such that any $k = 3$ parts can be used to reconstruct the secret.

The first step is to generate a random polynomial $f(x) = P_(k-1) (x) = a_0 + a_1 x + ... + a_(k-1) x^(k-1)$ of degree $k$ such that $a_0 = s$. This gives us the property that $f(0) = s$.

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
#import "@preview/cetz:0.3.1": *
#import "@preview/cetz-plot:0.1.0": plot, chart

#set text(size: 10pt)
#let f(x) = 42 + 5 * x + 3 * calc.pow(x, 2)

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
                    stroke: rgb(100, 100, 255, 150)
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

Based on the shares we generated earlier, let's take $Z_1(1, 50)$, $Z_3(3, 84)$ and $Z_5(5, 142)$ to reconstruct the polynomial $f(x)$:

```typst
#import "@preview/cetz:0.3.1": *
#import "@preview/cetz-plot:0.1.0": plot, chart

#set text(size: 10pt)

#let l1(x) = ((x - 3) * (x - 5) / (1 - 3) / (1 - 5)) * 50
#let l3(x) = ((x - 1) * (x - 5) / (3 - 1) / (3 - 5)) * 84
#let l5(x) = ((x - 1) * (x - 3) / (5 - 1) / (5 - 3)) * 142
#let f(x) = l1(x) + l3(x) + l5(x)


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
                    stroke: rgb(100, 100, 255, 150) + 2pt
                ),
                // mark: "o",
                mark-style: (
                    fill: rgb(100, 100, 255, 255), 
                    stroke: none
                ),
                line: "spline",
            )

            plot.add(
                l1, 
                domain: domain, 
                label: $ l_1 (x)  $,
                style: (
                    stroke: rgb(255, 100, 100, 150) + 1pt
                ),
                // mark: "o",
                mark-style: (
                    fill: rgb(255, 100, 100, 255), 
                    stroke: none
                ),
                line: "spline",
            )

            plot.add(
                l3, 
                domain: domain, 
                label: $ l_3 (x)  $,
                style: (
                    stroke: rgb(100, 255, 100, 150) + 1pt
                ),
                // mark: "o",
                mark-style: (
                    fill: rgb(100, 255, 100, 255), 
                    stroke: none
                ),
                line: "spline",
            )

            plot.add(
                l5, 
                domain: domain, 
                label: $ l_5 (x)  $,
                style: (
                    stroke: rgb(50, 155, 255, 150) + 1pt
                ),
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
## Rust Implementation

## Challenges Faced

## Use Cases

## Conclusion

## References / Suggested readings