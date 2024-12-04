---
title: Adaptor Signatures FtW
description: A simple and neat way to "lock" your Schnorr signatures
date: 2024-12-03
tags: [cryptography, maths]
---

When we compute and share a Schnorr signature, anyone can directly verify if it is valid for the attached message and signer. But what if we wanted to defer revealing the full signature while already emitting it to other people? We can produce such a signature by encrypting the nonce it contains with an additional scalar $y$.

This scalar will be published "along" with the signature in its public form $Y = y dot G$. The basic signing process is the following:

1. Sample the random nonce $hat(r) <- FF_q$, along with the locking scalar $y <- FF_q$
2. Compute their public versions $hat(R) = hat(r) dot G$ and $Y = y dot G$
3. Compute the _aggregated_ public nonce $R = hat(R) + Y$.
4. Hash the challenge $e = H(R || P || m)$ using the *aggregated* nonce $R$ and $P = p dot G$, where $p$ is the private key of the signer.
5. Compute and publish the (encrypted) locked signature $hat(s) = hat(r) + e p$

> [!NOTE]
> You may notice that we're never actually using $y$ in the signing process. This is a feature, not a bug! We can also generate this locked signature only knowing $Y$.

The final published data should be $(R, hat(s), Y)$ (along with the message $m$ of course). 

Anyone with $y$ will now be able to get the "decrypted" signature $s$, which is behind the locking point $Y$. 

With $r = hat(r) + y$, we will define $s$ as follows:

$$
s &= r + e p \
  &= (hat(r) + y) + e p \
  &= (hat(r) + e p) + y \
  &= hat(s) + y
$$

Likewise, if someone had both $s$ and $hat(s)$, they would also be able to recover $y$:

$$
&s = hat(s) + y \
<==> &y = s - hat(s)
$$

While $hat(s)$ isn't a valid Schnorr signature by itself:

$$
e = H(R || P || m) \ \
$$

$$
hat(s) dot G &=^? R + e P \
             &= (hat(R) + Y) + e P \
             &= (hat(r) + y) dot G + e p dot G \
             &= (hat(r) + y + e p) dot G \
             &= (hat(r) + e p) dot G + Y \
             &= underline(hat(s) dot G + Y != hat(s) dot G)
$$

We notice we can make the verification equation work if we add the public locking point $Y$:

$$
hat(s) dot G + Y &=^? R + e P \
$$

While this doesn't give us $s$, we can confirm that by adding $y$ to $hat(s)$, the resulting signature will be the one we're expecting!

$$
(hat(s) + y) dot G &=^? R + e P \
                   &= (R + Y) + e P \
                   &= (r + y) dot G + e p dot G \
                   &= ((r + e p) + y) dot G \
                   &= (hat(s) + y) dot G space checkmark
$$

## Secret Sharing + Adaptor Signatures = ?

One cool feature of $k$-of-$n$ treshold schemes, such as [Shamir's Secret Sharing](/posts/shamir), is that they can be integrated into pretty much anything that has a secret in it. This includes Adaptor signatures locking scalars!

By defining our polynomial $f(x)$ as follows:

$$
f(x) = y + a_1 x + a_2 x^2 + ... + a_(k-1) x^(k-1)
$$

We can split our locking scalar $y$ into $n$ shares $y_i | 1 <= i <= n$:

$$
y_i = f(i)
$$

With $k$ shareholders forming the recovery group $R$, we can then collectively reconstruct $y$ with [Lagrange interpolation](/posts/lagrange) (or any other similar interpolation method):

$$
y = f(0) = sum_(i in R) y_i dot product_(j in R, j!=i) (0-j)/(i-j)
$$

And unlock the adaptor signature!

$$
s = hat(s) + y
$$
