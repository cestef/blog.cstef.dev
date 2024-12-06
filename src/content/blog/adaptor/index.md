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
4. Hash the challenge $e = H(R || P || m)$ using the _aggregated_ nonce $R$ and $P = p dot G$, where $p$ is the private key of the signer.
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

## Atomic Swaps

Exchanging cryptocurrencies between different blockchains is hard. Typically, you'd need a trusted third party to act as a middleman, which would obviously need to be compensated financially for his work. Doing things this way is costly and pretty inefficient. Instead, we can leverage Adaptor Signatures to ensure that either both parties get what they expected, either both get nothing.

We have Alice, holder of $1 space suit.club$, and Bob, holder of $1 space suit.heart$. They want to exchange both their balances, and we assume they already know each other's addresses on both chains.

Alice starts by sampling $hat(r)_A, y <- FF_q$, and computes an adaptor signature as usual, on a message $m$ that attests the transaction of her $1 space suit.club$ to Bob's address:

$$
hat(R)_A = hat(r)_A dot G, space Y = y dot G \
R_A = hat(R)_A + Y \
e_A = H(R_A || P_A || m) \
hat(s)_A = hat(r)_A + e_A p_A
$$

The BIP340 standard expects to receive a signature pair in the form $(O, sigma)$, on which the following check is performed:

$$
sigma dot G =^? O + H(O || P || m) P
$$

If Bob was to try to give in $O = hat(R)_A$ and $sigma = hat(s)_A$:

$$
hat(s)_A dot G &=^? hat(R)_A + H(underline(hat(R)_A) || P_A || m) P_A \
             &!= underbrace(hat(R)_A + H(underline(R_A) || P_A || m) P_A, hat(s)_A dot G)
$$

Or $O = R_A$ and $sigma = hat(s)_A$:

$$
hat(s)_A dot G &=^? underline(R_A) + H(R_A || P_A || m) P_A \
             &!= underbrace(underline(hat(R)_A) + H(R_A || P_A || m) P_A, hat(s)_A dot G)
$$

You could say that he cannot satisfy both the challenge $e$ **and** the nonce $O$. To do so, he needs to know $y$ to compute $s_A = hat(s)_A + y$ so that when he gives in $O = R_A$ and $sigma = s_A$:

$$
(hat(s)_A + y) dot G &=^? R_A + H(R_A || P_A || m) P_A \
                   &= (r_A + e_A p_A) dot G \
                   &= s_A dot G space checkmark
$$

Back to our stuff, when Bob receives the adaptor signature $(R, hat(s), Y)$ from Alice, after having carefully verified that the given data is correct, he can also generate his own adaptor signature $s_B$ on Alice's $y$ by using $Y$:

$$
hat(r)_B <- FF_q \
R_B = hat(r)_B dot G + Y \
hat(s)_B = hat(r)_B + H(R_B || P_B || m) p_B
$$

After he sends it to Alice, she can claim the transaction linked to the signature $hat(s)_B$ by unlocking it with her $y$ and publishing it to the blockchain. By doing so, everyone will be able to see the transaction and the associated decrypted signature $s_B = hat(s)_B + y$.

After this publication, Bob will also be able to compute $y$ and unlock Alice's $hat(s)_A$:

$$
y = s_B - hat(s)_B \
s_A = hat(s)_A + y
$$

## Nullifying Adaptor Signatures

In the previous case, we saw how two parties could jointly sign a transaction without the need for a trusted third party. But what if one of the parties wanted to cancel the transaction? 

If Alice wants to cancel the transaction, she can simply discard her $y$ and never publish it. Bob will then be unable to unlock the signature $hat(s)_A$ and claim the transaction.

However, if Bob wants to cancel the transaction, how can Alice confirm that she will never publish $s_B$? There needs to be some sort of threat against Alice to ensure that she will not publish $s_B$.

### Private Key Exposure Threat

By publishing her random nonce $hat(r)_A$, Alice guarantees that she will never publish $s_B$. Otherwise, Bob will be able to recover $y = s_B - hat(s)_B$ and thus compute Alice's private key $p_A$:

$$
s_A &= hat(s)_A + y \
    &= underbrace(hat(r)_A + y + e, "known") dot p_A \ \
<==> p_A &= e^(-1) (s_A - (hat(r) + y))
$$

Bob can also verify that the nonce $hat(r)_A$ published by Alice is authentic:

$$
R_A = hat(r)_A dot G + Y
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