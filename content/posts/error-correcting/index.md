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

```
From: bob@example.com
To: alice@example.com

cat
```

`c` in ASCII is `01100011`, but what if we just... `01100010` ?

```
From: bob@example.com
To: alice@example.com

bat
```

Alice receives the message, looks at the picture, and replies:

```
From: alice@example.com
To: bob@example.com

That's clearly a cat. Did you fail biology? We are done together.
```

We clearly don't want this type of stuff to happen, right?

## Detecting errors and correcting them

Detecting whether a message was corrupted or not can be pretty straightforward:

Our initial message $m$ of length $n$ would simply be composed of single bits:

$$
m = {b_0, b_1, ..., b_n} | b_i in FF_2 = {0,1}
$$

But what if we simply repeat each bit $k$ times ?

$$
m = {b_0, b_1, ..., b_n} | b_i in FF_2^k
$$

For $k = 1$, we either have: $b_i = (1)$ or $m = (0)$, taking a geometrical approach, this can be represented as follows:

```typ, include=figures/line-distance.typ
```

A single "jump" (bit flip) would suffice to go from $(0)$ to $(1)$.

What about $k = 2$ ?

```typ, include=figures/square-distance.typ
```

Here, "correct" words are colored <span style="color:var(--color-green);">green</span>, while "incorrect" ones are in <span style="color:var(--color-red);">red</span>. For example if we receive $m = {(0,0), (0,1)}$, we know that at least one flip happened at $b_1 = (0,1)$.

> [!WARNING]
> We still can't correct a received message, because in this case, $(0,1)$ could be $(0,0)$ flipped on position $1$ or $(1,1)$ flipped on position $0$.

So, we now need **two** jumps to go from $(0,0)$ to $(1,1)$

You probaly guessed it, this pattern also holds for $k = 3$:

```typ, include=figures/cube-distance.typ
```

Suppose we received an erroneous word $(0,0,1)$, it is _more likely_ that it came from a single flip on $(0,0,0)$ than two flips on $(1,1,1)$. That way, we can start correcting received words.

Up until now, I kept talking about "jumps" from one word to another, but mathematically, this concept is called a **Hamming distance**. This formally defined as:

$$
d(x,y) = \#{i | x_i != y_i}
$$

Which basically means "the number of bits that differ from each word".

When we were repeating each bit several times, we applied a **code** to our message. In our case, this can be seen as the set of all possible values resulting from the application of an injective function from $FF^1$ to $FF^k$.

Generalizing what we just saw, a code $cal(C) = { (x,x,...,x) | x in FF_2} in FF_2^k$ has a minimum distance 

$$
d(cal(C)) = min{d(x,y) | x,y in cal(C) "and" x!=y}
$$

If our distance is $d(cal(C)) >= t + 1$, we can **detect** at most $t$ errors. If it's $d(cal(C)) >= 2t + 1$, we can **correct** at most $t$ errors. 


> [!NOTE]
> Saying that a code is able to correct $t$ errors also means that, geometrically, all balls of radius $t$ in $cal(C)$ defined by
> 
> $$
> B(x, t) = {y in FF_2^k | d(x,y) <= r} \
> $$
> 
> are disjointed:
>
> $$
> forall x,z in cal(C), x != z ==> B(x,t) sect B(z, t) = text(font: #(), emptyset)
> $$

## Linear Codes

Just like with vector spaces, a binary code $cal(C) subset.eq FF_2^k$ is linear if:

1) $arrow(0) = (0,0, ..., 0) in cal(C)$
2) $c, c' in cal(C) ==> c + c' in cal(C)$
3) $c in cal(C), a in FF_2 ==> a dot c = (a dot c_1, a dot c_2, ..., a dot c_n) in cal(C)$

Guess what this means? Matrices!

Each code $cal(C)$ of dimension $k$