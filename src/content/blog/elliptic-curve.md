---
title: Elliptic Curve and Shenanigans for Sane People
tags: [cryptography, maths]
description: A gentle introduction to elliptic curve cryptography, without the need for a PhD in mathematics.
date: 2024-11-29
growth: sapling
---

Elliptic curve cryptography (ECC) is a fascinating field of study that has been around for a while. It's a cornerstone of modern cryptography, and it's used in many applications, from secure messaging to cryptocurrencies. RSA, the most widely used public-key cryptosystem, is slowly being replaced by ECC due to its efficiency and security.

The trapdoor function (easy to do one way, hard the other) for an elliptic curve is the multiplication of a point $P$ by a scalar $n$ which is just adding the point $P$ to itself $n$ times. This operation is denoted as $n dot P$. If $n$ is large enough, it is computationally impossible to find $n$ for $Q = n dot P$, being given both $Q$ and $P$, in a reasonable time.

<details>
<summary>What is a "reasonable time"?</summary>

Let's suppose we have supercomputer that is able to compute $10^12$ point multiplications per second (generous assumption).

In a year, we have about $365 * 24 * 60 * 60 tilde.eq 31'556'952$ seconds, that means we could compute:

$$
31'556'952 dot 10^12 tilde.eq 10^19 "[keys/year]"
$$

Let's take a SECP256k1 private key for our example. The elliptic curve is over a 256-bit field, which means we have $2^256 tilde.eq 10^77$ possible keys.

$$
10^77/10^19 = 10^(77-19) = 10^58 "[years]"
$$

<small>For reference, the age of the universe is about $10^10$ years :D</small>

Even with a quantum computer capable of running non-stop, using Shor's algorithm, you'd need to perform $sqrt(2^256) = 2^(128) tilde.eq 10^38$ multiplications:

$$
10^38/10^19 = 10^19 "[years]"
$$
</details>

Let's start out by graphically representing the addition of two points $G$ and $A$ in an elliptic curve.

One easy way to think of the addition is to draw a line that goes through $G$ and $A$, and find the third point of intersection with the curve. The symmetrical point is the result of the addition of $G$ and $A$. This is because elliptic curve have the property that any line between two points intersects the curve at most one more time.

In the case where there is no third point of intersection (i.e. the line is vertical), we define the result of the addition as the point at infinity, denoted as $cal(O)$.

```typst
#set text(size: 10pt)

#let point(x) = (x, calc.sqrt(x*x*x + 7))
#let opposite(x) = (x, -calc.sqrt(x*x*x + 7))


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
        mark: (
          transform-shape: false,
          fill: color.darken(gray, 30%)
        )
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
                x-domain: (-5, 7),
                y-domain: (-6, 6),
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
            plot.add-anchor("G", point(-1.85))
            plot.add-anchor("A", point(0.5))
            plot.add-anchor("B", point(2))
            plot.add-anchor("C", opposite(2))
        }
    )

    line("plot.G", "plot.B", stroke: (dash: "dashed", paint: color.darken(gray, 30%)))
    line("plot.B", "plot.C", stroke: (dash: "dashed", paint: color.darken(gray, 30%)))
    let display_point(name, anchor: "north-west") = {
      circle("plot."+name, radius: 0.1, fill: black, name:name)
      content(name, [= $#name$], anchor: anchor, padding: 0.1)
    }
    display_point("G")
    display_point("A")
    display_point("B")
    display_point("C", anchor: "south-west")
})
```

The resulting point $B = G + A$ is then reflected to $C$ over the x-axis. This symmetry property is easily explained by the fact that the curve's $y$ coordinates are squared, so for a given $x$ coordinate, there are two possible $y$ coordinates, $y$ and $-y$.

The operation can then be done over and over again to find subsequent points.

```typst
#set text(size: 10pt)

#let point(x) = (x, calc.sqrt(x*x*x + 7))
#let opposite(x) = (x, -calc.sqrt(x*x*x + 7))


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
        mark: (
          transform-shape: false,
          fill: color.darken(gray, 30%)
        )
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
                x-domain: (-5, 7),
                y-domain: (-6, 6),
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
            plot.add-anchor("G", point(-1.85))
            plot.add-anchor("A", point(0.5))
            plot.add-anchor("B", point(2))
            plot.add-anchor("C", opposite(2))
            plot.add-anchor("D", opposite(1.2))
            plot.add-anchor("E", point(1.2))
            
        }
    )

    // line("plot.G", "plot.B", stroke: (dash: "dashed", paint: color.darken(gray, 30%)))
    // line("plot.B", "plot.C", stroke: (dash: "dashed", paint: color.darken(gray, 30%)))
    line("plot.C", "plot.G", stroke: (dash: "dashed", paint: color.darken(gray, 30%)))
    line("plot.D", "plot.E", stroke: (dash: "dashed", paint: color.darken(gray, 30%)))
    
    let display_point(name, anchor: "north-west") = {
      circle("plot."+name, radius: 0.1, fill: black, name:name)
      content(name, [= $#name$], anchor: anchor, padding: 0.1)
    }
    display_point("G", anchor: "south-east")
    // display_point("A")
    // display_point("B")
    display_point("C", anchor: "south-west")
    display_point("D", anchor: "south-west")
    display_point("E")
    
})
```

Given two points $A(x_A, y_A)$ and $B(x_B, y_B)$, the resulting coordinates of the point $C(x_C, y_C) = A + B$ can be found by:

1. Finding the slope $m$ of the line between $A$ and $B$.

    $$
    m = (y_B - y_A)/(x_B - x_A)
    $$

2. Finding the $x$ coordinate of $C$ by substituting $y = m(x - x_A) + y_A$ into the curve equation.

    $$
    y^2 = x^3 + 7 \
    <==> (m(x - x_A) + y_A)^2 = x^3 + 7 \
    <==> (m^2 (x - x_A)^2 + 2 m (x - x_A) y_A + y_A^2) = x^3 + 7 \
    <==> m^2 x^2 - m^2 2 x_A x + m^2 x_A^2 + 2m y_A x + 2m y_A x_A + y_A^2 = x^3 + 7 \
    $$

    Grouping each power of $x$ together nicely:

    $$
    x^3 - m^2 x^2 + (2 m^2 x_A - 2m y_A) x + (7 - m^2 x_A^2 - y_A^2 - 2m y_A x_A) = 0
    $$

    We have an single-variable third degree equation, and our good old friend [Viète](https://en.wikipedia.org/wiki/Vieta%27s_formulas) tells us that for a polynomial $P(x) = a_0 + a_1 x + ... + a_n x^n$ of degree $n$, we have $n$ roots:

    $$
    P(x) = 0 <==> cases(space x = x_1,space x = x_2, space ..., space x = x_n)
    $$

    Among other properties, these roots $x_i$ always satisfy:

    $$
    sum_(i = 0)^(n) x_i = x_1 + x_2 + ... + x_n = - (a_(n-1))/(a_n)
    $$

    Which means that in our case, we can write:

    $$
    x_A + x_B + x_C = -(-m^2)/1 = m^2
    $$

    Because we already know that the line will intersect with $A$ and $B$ (the grouped equation will be satisfied at both $x_A$ and $x_B$), we are left with only $x_C$:

    $$
    x_C = m^2 - x_A - x_B
    $$

3. Finding $y_C$ is as easy as plugging our freshly found $x_C$ into the equation of the line and reflecting it over the $x$-axis:
    $$
    y'_C = m(x_C - x_A) + y_A \
    $$

    $y'C$ is our intermediate point before it being reflected.

    $$
    y_C = -y'C &= -m(x_C - x_A) - y_A \
            &= m(x_A - x_C) - y_A
    $$

In the case where $G = A$, we can't really draw a line between the two points, so we take the tangent to the curve at $G$ and find the third point of intersection. This is the result of the addition of $G$ and $G$, denoted as $2 dot G$.

```typst
#set text(size: 10pt)

#let point(x) = (x, calc.sqrt(x*x*x + 7))
#let opposite(x) = (x, -calc.sqrt(x*x*x + 7))
#let slope(x,y) = (3*x*x)/(2*y)
#let tangent(xi, yi) = (x) => slope(xi, yi)* (x - xi) + yi

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
        mark: (
          transform-shape: false,
          fill: color.darken(gray, 30%)
        )
    )

    plot.plot(
        name: "plot",
        size: (12, 8),
        axis-style: "school-book",
        x-tick-step: 3,
        y-tick-step: 2,
        y-min: -6, y-max: 6,
        legend: "inner-north-east",
        legend-style: (
            stroke: black,
            fill: white,
            radius: 5pt,
            padding: .5em,
        ),
        {
            add-contour(
                x-domain: (-5, 7),
                y-domain: (-6, 6),
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
            let G = point(-.75)
            let t1 = tangent(G.at(0), G.at(1))
            let t2 = tangent(1.6, opposite(1.6).at(1))
            plot.add-anchor("G", G)
            plot.add-anchor("2G", point(1.6))
            plot.add-anchor("2G'", opposite(1.6))
            plot.add(t1, domain: (-5, 7), style: (stroke: green + 2pt, dash: "dashed"), label: $space t_G (x)$)
            plot.add(t2, domain: (-5, 7), style: (stroke: red + 2pt, dash: "dashed"), label: $space t_(2 G) (x)$)
            plot.add-anchor("3G", point(-1.87))
        }
    )
    line("plot.2G", "plot.2G'", stroke: (dash: "dashed", paint: color.darken(gray, 30%)))
    
    let display_point(name, anchor: "north-west", display: none) = {
      circle("plot."+name, radius: 0.1, fill: black, name:name)
      content(name, if (display != none){[#display]}else[= $#name$], anchor: anchor, padding: 0.1)
    }
    display_point("G", anchor: "south-east")
    display_point("2G", anchor: "south-east", display: [= $2 dot G$])
    display_point("2G'", anchor: "south-west", display: [= $(2 dot G)'$])
    display_point("3G", anchor: "south-west", display: [= $space 3 dot G$])
})
```

To find the tangent at $G(x_G, y_G)$, we need to find the slope $m = (d y)/(d x) = y'(x)$.

Differentiating both sides with respect to $x$, $y^2$, which actually depends on $x$ can be written as  $y(x)^2$ for clarity:

$$
(y(x)^2)' = 2y(x) dot y'(x)
$$

See this as if we were differentiating $u^2$, where $u = y(x)$.

The right side is just a function of $x$, so we can differentiate it as we would with any other function:

$$
(x^3 + 7)' = 3x^2 
$$

Our differentiated equation is:

$$
2y dot y'(x) = 3x^2 
$$

Solving for $m = y'(x)$:

$$
y'(x) = (3x^2)/(2y) = m 
$$

Notice that the tangent's slope depends on both $x$ and $y$, which makes sense because we'd have two different slopes otherwise:

$$
(3x^2)/(2y) = plus.minus (3x^2)/(2sqrt(x^3 + 7))
$$

And we have our tangent equation for $x_G$ and $y_G$:

$$
t: y &= m(x - x_G) + y_G \
     &= (3x_G^2)/(2y_G) (x - x_G) + y_G
$$