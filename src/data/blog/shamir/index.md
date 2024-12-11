---
title: Shamir Secret Sharing in a Nutshell
description: How to split a secret among multiple persons, so that only any subset of n people can recover it ?
tags: [cryptography, maths]
date: 2024-11-29
growth: sapling
---

> [!INFO]
> I am not a cryptographer, nor a mathematician. This article is the result of my own research and understanding of the subject. If you find any mistakes, [please let me know](mailto:hi@cstef.dev)!
>
> The vast majority of what is written here is taken from various sources, which are listed at the [end of this article](#references--suggested-readings). I highly recommend you to read them if you want to dive deeper into the subject.

The main idea behind Shamir Secret Sharing (SSS) is to split a secret $s$ into $n$ parts, such that any $k$ parts can be used to reconstruct the secret, but any $k-1$ parts are not enough to do so, and do not give any information about the secret.

### Splitting the Secret

Let's take the following example: we want to split the secret $s = 42$ into $n = 5$ parts, such that any $k = 3$ parts can be used to reconstruct the secret. It is supposed we are working in a finite field $FF_q$ for the entirety of this post.

<details>
<summary> What the hell is <code class="language-math math-inline">FF_q</code>?</summary>

A finite field $FF_q$ where $q = p^k | p in cal(P)$ ($q$ is a prime power), is a finite set of elements, on which we can apply our usual additions and multiplications.

The most common finite field is the set of integers modulo $q$, $ZZ/q ZZ = ZZ_q$, where all computations are taken $mod q$, which means that we have:

$$
ZZ_q = {0,1,2,..., q-1}
$$

<small>In the case of an [elliptic curve](/posts/elliptic-curve), $q$ is our curve's order.</small>
</details>

The first step is to sample a random polynomial $f(x) = P_(k-1) (x) = a_0 + a_1 x + ... + a_(k-1) x^(k-1)$ of degree $k-1$ such that $a_0 = s$. This gives us the property $f(0) = s$.

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

Thus, our shares are $Z_1(1, 50)$, $Z_2(2, 64)$, $Z_3(3, 84)$, $Z_4(4, 110)$ and $Z_5(5, 142)$.

Let's now plot the polynomial $f(x)$:

@include figures/lagrange1.typ

### Reconstructing the Secret

We know that $n+1$ points $Z_i (x_i, y_i) | i in S$ will suffice to construct the polynonial $P_n(x)$ of degree $n$. 

In our case, $deg(f(x)) = k-1$, so we need $(k-1)+1 = k$ points to restore $f(x)$, just as described in the beginning.

Based on the shares we generated earlier, let's take $Z_1(1, 50)$, $Z_3(3, 84)$ and $Z_5(5, 142)$ (our recovery group $R = {1,2,5}$) to reconstruct the polynomial $f(x)$ using Lagrange interpolation:

> [!TIP]
> If you're curious about Lagrange interpolation, I have written a [quick explaination](/posts/lagrange) for you to read.

$$
f(x) = sum_(i in R) y_i dot overbrace(product_(j in R, j!=i) (x-x_i)/(x_i - x_j), l_i(x)) \
$$

$$
f(x) &= 50 dot ((x-3)(x-5))/((1-3)(1-5)) + 84 dot ((x-1)(x-5))/((3-1)(3-5)) + 142 dot ((x-1)(x-3))/((5-1)(5-3)) \
     &= 25/4 (x - 5) (x - 3) + 71/4 (x - 1) (x - 3) - 21 (x - 5) (x - 1) \
     &= 42 + 5 x + 3 x^2 \
$$

It's even cooler when represented graphically:

@include figures/lagrange2.typ

### Commitments, Proofs and Verifications

In a perfect world where everyone is honest and where there are no transmission errors caused by cosmic rays, we could just send the shares to the participants and call it a day. But guess what? [Sh*t happens](https://en.wikipedia.org/wiki/Murphy%27s_law).

We need a way to check that the share we receive as a shareholder after the secret has been split is actually a valid one. You could gather with other bearers and collectively verify if the recovered secret is correct, but that is just too much hassle for such a simple task.

Instead, let's take advantage of the properties of elliptic curves to create a commitment scheme. After we have generated our polynomial $f(x)$, we can take each coefficient $a_i$ and multiply it by the generator point $G$ of the curve. This gives us a few values $C = {phi.alt_0, phi.alt_1, ..., phi.alt_(k-1)} | phi.alt_i = a_i dot G$ that we can send to the shareholders.

> [!TIP]
> If you are not familiar with basic elliptic curve stuff, I recommend that you read [my post](/posts/elliptic-curve) on the subject or the [references](#references--suggested-readings) listed at the end of this article.

When a shareholder wants to verify their share $Z_i = (i, f(i))$, they can check with the following equation:

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

Let's now instead take $phi.alt_i = a_i dot G + b_i dot H$ where $b_i$ comes from a randomly generated polynomial $g(x) = b_0 + b_1 x + ... + b_(k-1) x^(k-1)$, our blinding polynomial. $H != G$ is just another generator point on the curve. The dealer will now needs to distribute slightly different shares $Z_i = (i, f(i), g(i))$.

Shareholders may now verify their shares with:

$$
f(i) dot G + g(i) dot H &= sum_(j=0)^(k-1) (phi.alt_j dot i^j) \ 
                        &= sum_(j=0)^(k-1) ((a_i dot G + b_i dot H) dot i^j) \
                        &= sum_(j=0)^(k-1) (a_j i^j) dot G + sum_(j=0)^(k-1) (b_j i^j) dot H \
                        &= underline(f(i) dot G + g(i) dot H )
$$

This second method is known as **"Pedersen's Verifiable Secret Sharing"**.

### Bob just got hit by a bus, what now?

Our good old friend disappeared along with his share, and now other bearers are scared of losing too many shares until they can't recover the secret. They could reiterate the dealing procedure by all sending their shares to a single person which then redistributes the new ones. However this is not feasible in the case where everyone distrusts each other. We need a multi-computational way of re-issuing a new share without someone ever recovering the secret.

We will need $k$ shareholders, denoted $R$ to re-issue a new share $Z_ell = (ell, f(ell)) = (ell, z_ell)$.

Each shareholder begins by computing their Lagrange multiplier:

$$
l_i (ell) = product_(j in R,j!=i)(ell-j)/(i-j)
$$

After multiplying with their share $z_i = f(i)$, they randomly split it into $k$ so-called Lagrange-parts $partial_(i,j)$ in order to distribute them to other bearers $j$:

$$
z_i dot l_i &= partial_(i,1) + partial_(i,2) + ... + partial_(i,k)
$$

The exchange matrix $E$ can be represented as:

$$
E_(k times k) = mat(
    partial_(1,1), partial_(1,2),    dots.c, partial_(1,k);
    partial_(2,1), partial_(2,2),    dots.c, partial_(2,k);
           dots.v,        dots.v, dots.down,        dots.v;
    partial_(k,1), partial_(k,2),    dots.c, partial_(k,k);
)
$$

Where the $i$<sup>th</sup> row corresponds to the Lagrange-parts that the shareholder $i$ will **send** and the $j$<sup>th</sup> column to the Lagrange-parts the shareholder $j$ will **receive**.

Each shareholder $j$ computes the partial-share:

$$
sigma_j = sum_(i in R) partial_(i,j)
$$

Where $partial_(i,j)$ is the $j$<sup>th</sup> Lagrange-part of $i$. They respectively send $sigma_j$ to the new bearer $ell$, which finally computes his share:

$$
z_ell &= sum_(i in R) sigma_j \
$$

This can be rewritten as:

$$
sum_(j in R) sigma_j &= sum_(j in R) sum_(i in R) partial_(j,i) \ 
                     &= sum_(i in R) (sum_(j in R) partial_(j,i)) \ 
                     &= sum_(i in R) (partial_(1,i) + partial_(2,i) + ... + partial_(3,i)) \
                     &= sum_(i in R) z_i dot l_i = underline(f(ell)) \
$$

### Inception

Another angle to tackle this problem from is to re-use Secret Sharing _inside_ our Secret Sharing scheme (Inception, anyone?).

Let's say we have our recovery group $R$, our new shareholders $N$ and $A = R union N$ for convenience. 

1. Each shareholder $i in R$ generates a random polynomial $g_i (x)$ of degree $k-1$.
2. They each compute the auxiliary shares $d_(i,j) = g_i (j)$ for $j in A$.
3. Every shareholder $j in A$ receives the auxiliary shares $d_(i,j)$ from the recovery group.
4. Each shareholder $j in R$ computes the aggregated share $H(j) = u_j = z_j + sum_(i in R) d_(i,j)$ and shares it to everyone in $N$.
5. Each future bearer $ell in N$ can interpolate the polynomial $H(x)$ from the shares $u_j | j in R$ and compute their share 
   $$
   z_ell = H(ell) - sum_(i in R) d_(i,ell) = u_ell - sum_(i in R) d_(i,ell)
   $$

Let's take a look at the math:

$$
z_ell &= (H(ell) - sum_(i in R) d_(i, ell)) | ell in N \
      &= underbrace(sum_(i in R) (z_i + sum_(k in R) g_k (i)) dot product_(j in R, j!=i) (ell-j)/(i-j), H(ell)) - sum_(i in R) g_i (ell)\
      &= underbrace(sum_(i in R) (z_i dot product_(j in R, j!=i) (ell-j)/(i-j)), f(ell)) + sum_(i in R)(sum_(k in R) g_k (i)dot product_(j in R, j!=i) (ell-j)/(i-j))  - sum_(i in R) g_i (ell)\
      &= f(ell) + sum_(k in R)underbrace(sum_(i in R) g_k (i)dot product_(j in R, j!=i) (ell-j)/(i-j), g_k (ell))  - sum_(i in R) g_i (ell)\
      &= f(ell) + underbrace(sum_(k in R) g_k (ell)  - sum_(i in R) g_i (ell), = space 0) \
      &= f(ell)
$$

But wait! We just learnt how to implement a secure, verifiable secret sharing scheme and we aren't even using it!

### Verifiable Inception

Let's review the protocol, this time including relevant checks to ensure the data we're receiving is genuine. We assume the original dealer was a good guy and already used Feldman's VSS, providing the commitments $C = {phi.alt_0, phi.alt_1, ..., phi.alt_(k-1)} | phi.alt_i = a_i dot G$ for the OG polynomial $f(x) = a_0 + a_1 x + ... + a_(k-1) x^(k-1)$ to everyone.

1. Each shareholder $i in R$ generates a random polynomial $g_i (x) = b_(i,0) + b_(i,1) x + ... + b_(i,k-1) x^(k-1)$ of degree $k-1$.
2. They also compute and share for $j in R$ to see their commitments: 
   $$
   Gamma_i = {psi_(i,0), psi_(i, 1), ..., psi_(i, k-1)} | psi_(i,j) = b_(i,j) dot G
   $$
3. They each compute the auxiliary shares $d_(i,j) = g_i (j)$ for $j in A$, and shares them **once they have received all other $Gamma_i | i in R$**
4. Every shareholder $j in A$ receives the auxiliary shares $d_(i,j)$ from $i in R$ and checks whether they match $Gamma_i$
   $$
   d_(i,j) dot G &= sum_(m=0)^(k-1) psi_(i,m) dot j^m 
                  = sum_(m=0)^(k-1) b_(i,m) dot G dot j^m \
                 &= sum_(m=0)^(k-1) (b_(i,m) dot j^m), g_i(j) dot G \
                 &= g_i(j) dot G 
   $$
5. Before computing anything else, each shareholder $j in R$ commits to the upcoming $H(x)$ polynomial and sends it to $i in A$:
   $$
   T = {theta_i}_(i in R) | theta_i = sum_(k in R) psi_(i, k)
   $$
6. Each shareholder $j in R$ computes the aggregated share $H(j) = u_j = z_j + sum_(i in R) d_(i,j)$.
7. Each inductee $i in N$ first waits to receive all $T$, checks that they are the same from everyone, and then receives $u_j | j in R$. 
8. Each future shareholder $i in N$ checks whether each given $u_j | j in R$ is genuine:
   $$
   u_j dot G &= sum_(i=0)^(k-1) phi.alt_i + sum_(i in R) theta_i \
             &= sum_(i=0)^(k-1) a_i j^i dot G + sum_(i in R) sum_(m in R) psi_(i, m) \
             &= sum_(i=0)^(k-1) a_i j^i dot G + sum_(i in R) sum_(m in R) b_(i,m) j^m dot G \
             &= (sum_(i=0)^(k-1) a_i j^i + sum_(i in R) sum_(m in R) b_(i,m) j^m) dot G \
             &= (f(j) + sum_(i in R) g_i(j)) dot G 
              = (z_j + sum_(i in R) d_(i,j)) dot G \
             &= H(j) dot G = u_j dot G
   $$
9.  Each future bearer $j in N$ can interpolate the polynomial $H(x)$ from the shares $u_j$ and compute their share 
    $$
    z_j = H(j) - sum_(i in R) d_(i,j) = u_j - sum_(i in R) d_(i,j)
    $$

### Single share issuing

In the case where we only want to issue a single share, [conduition](https://conduition.io/cryptography/shamir/#Issuing-a-New-Share) proposed a clever way to remove the subtracting step at the end by adding a root at $ell | {ell} = N$ to the blinding polynomial. This way, we have:

$$
g_i (x) = (x - ell) dot P_(k-2) (x) | i in S, space P_(k - 2) (x) <- FF_q [x]
$$

When interpolating $H(ell)$, the blinding polynomials $g_i (ell) | i in S$ cancel out and we directly get $z_ell$:

$$
z_ell &= H(ell) \
      &= sum_(i in S) (z_i + u_i)  dot product_(j in S, j!=i) (ell - j)/(i-j) \
      &= sum_(i in S) (z_i + sum_(m in S) g_m (i))  dot product_(j in S, j!=i) (ell - j)/(i-j) \
      &= sum_(i in S) (z_i dot product_(j in S, j!=i) (ell - j)/(i-j)) + sum_(i in S) (sum_(m in S) g_m (i) dot product_(j in S, j!=i) (ell - j)/(i-j)) \
      &= z_ell + underbrace(sum_(m in S) g_m (ell), = space 0) \
      &= z_ell
$$

<small>Note that we could try to add multiple roots: $(x- ell_1)(x-ell_2) dot g_i (x)$, but then all the new shareholders would have access to the new shares.</small>

You could also apply the same verifying scheme as before to this method.

### We have a problem

When recovering the secret, we need to trust a single recoverer to do so and all send him all of our shares. But what if we all wanted to recover the secret at the same time?

One may naively try to implement a simple broadcast or pairwise exchange protocol, but if a single malicious actor $P_m$ wanted to prevent the others from also recovering the secret, he could just wait for everyone to send their share, and never send his. He will have all the shares needed, while the others can't do anything.

If everyone distrusts each other, we will have this strange situation where no one wants to send their share first. One may prove that they own a valid share with a Zero-Knowledge Proof ZKP, but will never be able to prove that he's actually going to send it to the others.

One "solution" to this problem (in my opinion the easiest to implement) is to set a pre-defined order in which shareholders need to reveal their shares, after which it is verified each time by the others. If the share is invalid or the bearer fails to send it within a given time, the others can post a complaint against this user and abort the process.

#### Commitments-based ordering

After each shareholder has shared his commitment $C_i = y_i dot G$ and it has been verified by everyone else, the order of reveal is defined by the value of each commitment. Let's recall our commitments for $f(x) = a_0 + a_1 x + ... + a_(k-1) x^(k-1)$:

$$
C = {phi.alt_0, phi.alt_1, ..., phi.alt_(k-1)} | phi.alt_i = a_i dot G
$$

One cannot manipulate the value of $y_i dot G$ as it is verifiable by the others with 

$$
y_i dot G = sum_(i = 0)^(k-1) phi.alt_i
$$

The probability of a malicious actor being placed last in the queue and thus fool everyone is $1/k$ for $k$ recoverers if we suppose that $y_i dot G$ is pseudorandom. Not that good.

#### Incremental recovery

Let's instead require each bearer to **first** send their share to everyone placed before them in the pre-defined order.

```typst
#import "@preview/fletcher:0.5.2" as fletcher: *

#diagram(
  spacing: (1em, 1em),  
  $
    P_1 edge("rr",y_1, "-|>")  && S = {y_1}, space  R = {P_1} \
    P_2 edge("rr", y_2, "-|>") && R edge("rr", "-|>", y_2 space checkmark) && S = {y_1, y_2}, space R= {P_1, P_2 }edge("rr", "-|>", S) && P_2 \
    P_k edge("rr", "-|>", y_k) && R edge("rr", "-|>", y_k space checkmark) && S = {y_1, y_2, ..., y_k} edge("rr", "-|>", S) && P_k \
    & space
  $
)
```

We have a single shared state $R$ that needs to be kept up-to-date for everyone at each round. This is to keep track of who has and who hasn't sent their share yet. The state $S$ consisting of every sent share does not need to be shared as everyone can keep track of the broadcasts to $R$ received. 

This way, a single malicious shareholder cannot dupe the rest of the group. But what if **two** malicious actors $P_m$ and $P_m'$ tried hijacking the recovery ?

1. $P_1$ initiates $S = {y_1}, space R = {P_1}$
2. $P_2$ sends $y_2$ to $R$, and gets accepted: $S = {y_1, y_2}, space R = {P_1}$
3. $P_m$ joins normally as well, he gets access to $S$
4. $P_3$ joins, and so on for other $P_i$
5. $P_m'$ only sends his share to $P_m$, which sends him $S$ back (or not)

In this case, $P_m$ (and $P_m'$) are the only ones able to recover the secret. This isn't of any good either...

#### Inception, again

To prevent a single actor from hijacking the recovery, we will leverage once again an Inception-like scheme. Here, our new scheme will be $2$-out-of-$k$. 

Each shareholder $i in R$ generates a random polynomial $g_i (x) = z_i + b_(i,1) x$ of degree $1$, where $z_i$ is their respective share.

The commitment and sharing phase of $g_i(j) | i,j in R$ continues as usual, and before recovering the secret, two shareholders $P_m$ and $P_m'$ are chosen to reveal their shares. This way, when $P_m$ broadcasts his shares $g_i(m) | i in R$, everyone is instantly able to recover the secret. 

The last step is to verify that $P_m'$ also sends his shares to $P_m$. If he does not, every other shareholder can post a complaint against him and optionally send his shares to $P_m$, who can then recover the secret.

This way, we have a pretty good guarantee that the secret will be recovered by everyone, except if that very person was being explicitly targeted by the whole recovery group ($k-1$ people).

## References / Suggested readings

- **Issuing New Shamir Secret Shares Using Multi-Party Computation**  
    [conduition.io](https://conduition.io/cryptography/shamir/)

- **Novel Secret Sharing and Commitment Schemes for Cryptographic Applications**  
    Mehrdad Nojoumian  
    [dspacemainprd01.lib.uwaterloo.ca](https://dspacemainprd01.lib.uwaterloo.ca/server/api/core/bitstreams/e180c165-7b6c-4cfc-bc5c-62dc5af674d2/content) <small>[PDF]</small>

- **A Share-Correctable Protocol for the Shamir Threshold Scheme and Its Application to Participant Enrollment**  
    Raylin Tso, Ying Miao, Takeshi Okamoto and Eiji Okamoto  
    [citeseerx.ist.psu.edu](https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=634526d46b7c52c62582d7c6c32b79502bd631d3) <small>[PDF]</small>

- **Feldman’s Verifiable Secret Sharing for a Dishonest Majority**  
    Yi-Hsiu Chen and Yehuda Lindell  
    [eprint.iacr.org](https://eprint.iacr.org/2024/031.pdf) <small>[PDF]</small>

- **Adaptively Secure Feldman VSS and Applications to Universally-Composable Threshold Cryptography**  
    Masayuki Abe and Serge Fehr  
    [eprint.iacr.org](https://eprint.iacr.org/2004/119.pdf) <small>[PDF]</small>
