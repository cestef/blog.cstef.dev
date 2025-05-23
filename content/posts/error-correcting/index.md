+++
title = "Oops Engineering"
description = "Stuff breaks. Bits flip. Error correcting codes shrug and fix it."
date = 2025-05-15
draft = true
taxonomies.tags = ["maths"]
+++

When we send data through wires, waves, or lasers, it’s tempting to believe everything arrives just fine. But reality — and Murphy — loves chaos:

> If a bit can flip, it will flip.

Let's take the following scenario:

Bob wants to send Alice a cute message along with an image of his cat:

![Cat on a watermelon](images/cat.png)

```text
From: bob@example.com
To: alice@example.com

cat
```

`c` in ASCII is `01100011`, but what if we just... `01100010` ?

```text
From: bob@example.com
To: alice@example.com

bat
```

Alice receives the message, looks at the picture, and replies:

```text
From: alice@example.com
To: bob@example.com

That's clearly a cat. Did you fail biology? We are DONE together.
```

We clearly don't want this type of stuff to happen, right?

## Detecting errors and correcting them

Detecting whether a message was corrupted or not can be pretty straightforward:

Our initial message $m$ of length $n$ would simply be composed of single bits:

$$
m = {b_0, b_1, ..., b_n} | b_i in FF_2 = {0,1}
$$

But what if we repeat each bit $r$ times ? For a repetition code, our codeword becomes:

$$
c = {(b_0, b_0, ..., b_0), (b_1, b_1, ..., b_1), ..., (b_n, b_n, ..., b_n)} | b_i in FF_2^r
$$

For $r = 1$, we either have: $c_i = (1)$ or $c_i = (0)$, not very exciting. Taking a geometrical approach, this can be represented as follows:

```typ, include=figures/line-distance.typ
```

A single "jump" (bit flip) would suffice to go from $(0)$ to $(1)$.

What about $r = 2$ ?

```typ, include=figures/square-distance.typ
```

Here, "correct" words are colored <span style="color:var(--color-green);">green</span>, while "incorrect" ones are in <span style="color:var(--color-red);">red</span>. For example if we receive $m = {(0,0), (0,1)}$, we know that at least one flip happened at $b_1 = (0,1)$.

> [!WARNING]
> We still can't correct a received message, because in this case, $(0,1)$ could be $(0,0)$ flipped on position $1$ or $(1,1)$ flipped on position $0$.

So, we now need **two** jumps to go from $(0,0)$ to $(1,1)$

You probably guessed it, this pattern also holds for $r = 3$:

```typ, include=figures/cube-distance.typ
```

Suppose we received an erroneous word $(0,0,1)$, it is _more likely_ that it came from a single flip on $(0,0,0)$ than two flips on $(1,1,1)$. That way, we can start correcting received words.

Up until now, I kept talking about "jumps" from one word to another, but mathematically, this concept is called a **Hamming distance**. This formally defined as:

$$
d(x,y) = |{i | x_i != y_i}|
$$

Which basically means "the number of bits that differ from each word".

When we were repeating each bit several times, we applied a **code** to our message. In our case, this can be seen as the set of all possible values resulting from the application of an injective function from $FF_2^1$ to $FF_2^r$.

Generalizing what we just saw, a code $cal(C)$ has a minimum distance

$$
d(cal(C)) = min{d(x,y) | x,y in cal(C) "and" x!=y}
$$

If our distance is $d(cal(C)) >= t + 1$, we can **detect** at most $t$ errors. If it's $d(cal(C)) >= 2t + 1$, we can **correct** at most $t$ errors.

> [!NOTE]
> Saying that a code is able to correct $t$ errors also means that, geometrically, all balls of radius $t$ in $cal(C)$ defined by
>
> $$
> B(x, t) = {y in FF_2^n | d(x,y) <= r}
> $$
>
> are disjointed:
>
> $$
> forall x,z in cal(C), x != z ==> B(x,t) sect B(z, t) = text(font: #(), emptyset)
> $$

## Linear Codes

Just like with vector spaces, a binary code $cal(C) subset.eq FF_2^n$ is linear if:

1) $arrow(0) = (0,0, ..., 0) in cal(C)$
2) $c, c' in cal(C) ==> c + c' in cal(C)$
3) $c in cal(C), a in FF_2 ==> a dot c = (a dot c_1, a dot c_2, ..., a dot c_n) in cal(C)$

Guess what this means? Matrices!

Each code $cal(C)$ of dimension $k$ and length $n$ admits a generator matrix:

$$
G_(k times n) = mat(
    a_(0, 0), a_(0, 1), dots.h, a_(0, n-1);
    a_(1, 0), a_(1, 1), dots.h, a_(1, n-1);
    dots.v, dots.v, dots.down, dots.v;
    a_(k-1, 0), a_(k-1, 1), dots.h, a_(k-1, n-1);
)
$$

For any message $m = (m_1 m_2, ..., m_(k-1))$, we can obtain its encoded version by simply using matrix multiplication:

$$
c = m dot G = (m_1 m_2, ..., m_(k-1)) dot G
$$

This means our code $cal(C)$ is the image of the linear application represented by $G$:

$$
cal(C) = {m dot G | m in FF_2^k}
$$

A generator matrix in its systematic form looks like this:

$$
G = (I_(k times k) | P_(k times n-k))
$$

Where $I$ is the identity matrix:

$$
I_(k times k) = mat(
    1, 0, dots.h, 0;
    0, 1, dots.h, 0;
    dots.v, dots.v, dots.down, dots.v;
    0, 0, dots.h, 1;
)
$$

This is sort of just to "copy" as-is the message $m$ into the codeword $c$. The rest of the matrix $P$ is used to add redundancy to our message.

But wait, how do we detect errors now? This is where the **parity check matrix** $H$ comes in:

$$
H_((n-k) times n) = mat(
    p_(0, 0), p_(0, 1), dots.h, p_(0, n-1);
    p_(1, 0), p_(1, 1), dots.h, p_(1, n-1);
    dots.v, dots.v, dots.down, dots.v;
    p_(n-k-1, 0), p_(n-k-1, 1), dots.h, p_(n-k-1, n-1);
)
$$

$H$ is designed specifically so that:

$$
forall c in cal(C), H dot c^T = arrow(0)
$$

<details>
<summary>What the hell does <span>

$c^T$
</span> mean?</summary>

The $T$ in $c^T$ means "transpose". In other words, we are taking the codeword $c$ and flipping it over. This is a common operation in linear algebra, and it allows us to treat the codeword as a column vector instead of a row vector.

For example:

$$
c = mat(
    1, 2, 3;
    4, 5, 6;
    7, 8, 9;
)
$$

The transpose of $c$ would be:

$$
c^T = mat(
    1, 4, 7;
    2, 5, 8;
    3, 6, 9;
)
$$
</details>

In other words, for any valid codeword, multiplying by $H$ gives us the zero vector. If we receive a potentially corrupted word $r$, we can compute its syndrome:

$$
s = H dot r^T
$$

If $s = arrow(0)$ then either $r$ is valid or contains too many errors for us to detect. If $s != arrow(0)$, we know errors occurred.

To compute $H$ from $G = (I | P)$, we can use the following formula:

$$
H = (P^T | I_(n-k times n-k))
$$
