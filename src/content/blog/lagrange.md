---
title: Lagrange Interpolation Primer
description: A quick and simple explaination on the concept of polynomial interpolation, here Lagrange's in particular.
tags: [maths]
date: 2024-11-29
growth: sapling
---

You may remember, when in High School, being asked to find the equation of a line that goes through two points. The process was straightforward: you would calculate the slope $a$ and the intercept $b$ of the line $f(x) = a x + b$. 

This is a simple example of polynomial interpolation, where we are trying to find a polynomial that goes through a set of points. While the process is simple for a line, it becomes slightly more complex for higher degree polynomials.

### Polynomials

One of the most, if not *the* most important property of polynomials, is that each one of them can uniquely be described by $n+1$ points for a polynomial of degree $n$, noted $f(x) in PP_n$.

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

We can see that we have $n+1$ equations for $n+1$ factors of $x$, noted $u_i | 0 <= i <= n$, which could also be represented with the following Vandermonde matrix equation:

$$
mat(
    1, x_0, x_0^2, dots.c, x_0^(n);
    1, x_1, x_1^2, dots.c, x_1^(n);
    dots.v, dots.v, dots.v, dots.down, dots.v;
    1, x_n, x_n^2, dots.c, x_n^(n);
)
mat(u_0; u_1; dots.v; u_(n)) = mat(y_0; y_1; dots.v; y_n)
$$

Written as $V u = y$, we can solve this by inverting $V$: 

$$
u = V^(-1) y
$$

This is doable by applying the [Jordan-Gauss algorithm](https://en.wikipedia.org/wiki/Gaussian_elimination) to the augmented matrix $V | I$, where $I$ is the identity matrix (diagonal filled with $1$s), until we only have pivots equal to $1$:

$$
mat(
    1, x_0, x_0^2, dots.c, x_0^(n) space, space 1, 0,dots.c, 0;
    1, x_1, x_1^2, dots.c, x_1^(n) space, space 0, 1, dots.c, 0;
    dots.v, dots.v, dots.v, dots.down, dots.v space, space dots.v, dots.v ,dots.down, dots.v;
    1, x_n, x_n^2, dots.c, x_n^(n) space, space 0, 0, dots.c, 1;
    augment: #5
)
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

A line is essentially just $f(x) = a x + b$, which is of degree $1$. We can guess and deduce we need at least $n+1$ points to describe a polynomial function $f(x) in PP_n$.

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

Let's take $A_0 (0, 1)$, $A_1 (1, 3)$, $A_2 (2, 2)$ and $A_3 (3, 4)$ to demonstrate this method.

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

The main principle behind this is to split the wanted function into multiple sub-functions $l_i (x)$, that each contribute to one given point, also called "node".

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

<details>
<summary> Why does multiplying by <code class="language-math math-inline">(x-x_j)</code> add a root ?</summary>

For a function $f(x) = (x - x_j) dot g(x) | g(x) <- RR[x]$, when $x = x_j$:

$$
f(x_j) = (x_j - x_j) dot g(x) = 0 dot g(x) = 0
$$

</details>

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

The polynomial $f(x) in PP_3$ is computed by summing all the $l_i (x)$ together and multiplying them by the corresponding $y_i$:

$$
f(x) &= y_0 l_0 (x) + y_1 l_1 (x) + y_2 l_2 (x) + y_3 l_3 (x) \
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

And we have our final polynomial which effectively goes through all the points:

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


Generalizing this process, we can write the function $f(x) in PP_n (x)$ that goes through $n+1$ points $A_i (x_i, y_i)$:

$$
f(x) &= sum_(i=0)^n y_i l_i (x) \
        &= sum_(i=0)^n y_i product_(j=0, j!=i)^n (x - x_j) /  (x_i - x_j) 
$$
