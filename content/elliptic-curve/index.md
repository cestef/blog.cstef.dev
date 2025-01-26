+++
title = "Elliptic Curves for Sane People"
description = "A gentle introduction to elliptic curve cryptography, without the need for a PhD in mathematics."
date = 2024-11-29
[taxonomies]
tags = ["crypto"]
+++

> [!NOTE]
> I am not a cryptographer, nor a mathematician. This article is the result of my own research and understanding of the subject. If you find any mistakes, [please let me know](mailto:hi@cstef.dev)!
>
> The vast majority of what is written here is taken from various sources, which are listed at the [end of this article](#references-and-suggested-readings). I highly recommend you to read them if you want to dive deeper into the subject.


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

```typ,include=figures/1.typ
```

The resulting point $B = G + A$ is then reflected to $C$ over the x-axis. This symmetry property is easily explained by the fact that the curve's $y$ coordinates are squared, so for a given $x$ coordinate, there are two possible $y$ coordinates, $y$ and $-y$.

The operation can then be done over and over again to find subsequent points.

```typ,include=figures/2.typ
```

> [!NOTE]
> We will be working with [Short Weierstrass form](https://en.wikipedia.org/wiki/Elliptic_curve) curves, which are the most common form of elliptic curves used in cryptography. The equation of the curve is $y^2 = x^3 + a x + b$.

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

    $y'_C$ is our intermediate point before it being reflected.

    $$
    y_C = -y'_C &= -m(x_C - x_A) - y_A \
            &= m(x_A - x_C) - y_A
    $$

In the case where $G = A$, we can't really draw a line between the two points, so we take the tangent to the curve at $G$ and find the third point of intersection. This is the result of the addition of $G$ with itself, denoted as $2 dot G$.

```typ,include=figures/3.typ
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
2y(x) dot y'(x) = 3x^2 
$$

Solving for $m = y'(x)$:

$$
y'(x) = (3x^2)/(2y(x)) = m 
$$

Notice that the tangent's slope depends on both $x$ and $y$, which makes sense because we'd have two different slopes otherwise:

$$
(3x^2)/(2y(x)) = plus.minus (3x^2)/(2sqrt(x^3 + 7))
$$

And we have our tangent equation for $x_G$ and $y_G$:

$$
t: y &= m(x - x_G) + y_G \
     &= (3x_G^2)/(2y_G) (x - x_G) + y_G
$$

## References and Suggested readings

- **A (Relatively Easy To Understand) Primer on Elliptic Curve Cryptography**  
    Nick Sullivan  
    [cloudflare.com](https://blog.cloudflare.com/a-relatively-easy-to-understand-primer-on-elliptic-curve-cryptography/)


- **Elliptic Curve Cryptography (ECC)**  
    Svetlin Nakov  
    [cryptobook.nakov.com](https://cryptobook.nakov.com/asymmetric-key-ciphers/elliptic-curve-cryptography-ecc)