---
title: Elliptic Curve and Shenanigans for Sane People
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
#let f1(x) = calc.pow(x, 2) + x - 3 ;

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
g(x) = x^2 + x - 3 space (mod space 79)
$$

For $x in NN$:

```typst
#let g1(x) = calc.rem-euclid(calc.pow(x, 2) + x - 3, 79);

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


### Notations

Just so we're all on the same page:

|             |                                                              |
| ----------- | ------------------------------------------------------------ |
| $a \|\| b$  | Deterministic concatenation of $a$ and $b$                   |
| $FF_q$      | Finite / Galois field of order $q$                           |
| $a dot G$   | Multiply $a$ by the generator point $G$ of an elliptic curve |
| $x <- ZZ_n$ | Sample $x$ from $ZZ_n$                                       |


## How Shamir's Secret Sharing Works

With the basics of polynomials and Lagrange interpolation in mind, let's dive in!

The main idea behind this is to split a secret $s$ into $n$ parts, such that any $k$ parts can be used to reconstruct the secret, but any $k-1$ parts are not enough to do so, and do not give any information about the secret.

> [!INFO]
> If you are not comfortable with the concept of Finite Fields, I recommend you to read some of the [resources](#references--suggested-readings) I listed at the end of this article.
>
> It is supposed that we are working in $FF_q$ when not specified.

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

This secret can now be used as a symmetric key for encryption, a seed for a PRNG, TOTP key, etc.


## Rust Implementation

I've been using Rust for a while now (_even though I feel like I'm a complete beginner and still can't manage to fully understand lifetimes_), so I thought it would be a good idea to implement Shamir's Secret Sharing and other algorithms in Rust.

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

### Reconstructing the Secret

```rust copy
// See the Polynomial struct for the implementation of the Lagrange interpolation
pub fn recover(shares: Vec<Share>) -> Scalar {
    Polynomial::lagrange(shares).evaluate(Scalar::ZERO)
}
```

### Schnorr Signatures

For this part, I used the Secp256k1 curve, _via_ the really cool [`secp`](https://lib.rs/secp) crate. The implementation is quite similar to the one I described earlier.

```rust copy
use rand::rngs::OsRng;
use secp::{Point, Scalar, G};
use sha2::{Digest, Sha256};

fn compute_challenge(public_nonce: Point, public_key: Point, message: impl AsRef<str>) -> Scalar {
    // H(R || P || m)
    let challenge: [u8; 32] = Sha256::new()
        .chain_update((public_nonce).serialize())
        .chain_update((public_key).serialize())
        .chain_update(message.as_ref().as_bytes())
        .finalize()
        .into();
    Scalar::reduce_from(&challenge)
}

fn sign(message: impl AsRef<str>, key: Scalar) -> Result<Signature> {
    // Enabled via the `rand` feature of the `secp` crate
    let nonce = Scalar::random(&mut OsRng); // r

    let public_nonce = nonce * G; // R
    let public_key = key * G; // P

    let challenge = compute_challenge(public_nonce, public_key, message); // e
    // s = r + e * p
    let signature = (nonce + challenge * key).not_zero()?;

    Ok((public_nonce, signature))
}

fn verify(message: impl AsRef<str>, public_key: Point, signature: Signature) -> Result<bool> {
    let challenge = compute_challenge(signature.0, public_key, message);
    // s * G =? R + e * P
    Ok(signature.1 * G == (signature.0 + challenge * public_key).not_inf()?)
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
    [eprint.iacr.org](https://eprint.iacr.org/2024/031.pdf) <small>[PDF]</small>

- **Adaptively Secure Feldman VSS and Applications to Universally-Composable Threshold Cryptography**  
    Masayuki Abe and Serge Fehr  
    [eprint.iacr.org](https://eprint.iacr.org/2004/119.pdf) <small>[PDF]</small>

- **Asymmetric Key Ciphers**  
    Svetlin Nakov  
    [cryptobook.nakov.com](https://cryptobook.nakov.com/asymmetric-key-ciphers)

- **Novel Secret Sharing and Commitment Schemes for Cryptographic Applications**  
    Mehrdad Nojoumian  
    [dspacemainprd01.lib.uwaterloo.ca](https://dspacemainprd01.lib.uwaterloo.ca/server/api/core/bitstreams/e180c165-7b6c-4cfc-bc5c-62dc5af674d2/content) <small>[PDF]</small>

- **A Share-Correctable Protocol for the Shamir Threshold Scheme and Its Application to Participant Enrollment**  
    Raylin Tso, Ying Miao, Takeshi Okamoto and Eiji Okamoto  
    [citeseerx.ist.psu.edu](https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=634526d46b7c52c62582d7c6c32b79502bd631d3) <small>[PDF]</small>


## Acknowledgements

I wanted to thank [conduition.io](https://conduition.io) for his amazing articles on cryptography. They are a great source of inspiration and knowledge, and I highly recommend you to check them out if you want to learn more about cryptography.