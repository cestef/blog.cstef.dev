---
title: The Maths Behind RSA
tags: [cryptography, maths]
description: One of the most widely used encryption algorithms, RSA relies on the mathematical properties of prime numbers and modular arithmetic.
date: 2024-09-06
state: sapling
---

RSA (named after its inventors, Ron **R**ivest, Adi **S**hamir, and Leonard **A**dleman) is one of the most widely used encryption algorithms in the world. It's used to secure everything from online banking transactions to secure communication between devices. But how does it work? What are the mathematical principles behind it? Let's dive in.

## Historical Context

Asymmetric encryption, also known as public-key cryptography, was a game-changer in the world of cryptography. Before its invention, symmetric encryption was the norm, where both parties shared a secret key to encrypt and decrypt messages.

As the name implies, with asymmetric encryption, we now have **two** keys: a public and a private one. The public one can be shared with anyone, and the private needs to be kept secret. Let's take our good old Alice and Bob to illustrate this!

```pikchr
circle "Bob"
arrow right 250% "I love you <3" above
box width 120% height 120% "Encryption" "with Alice's" "public key"
arrow right 350% "spq349832uç*%&2(Z*48" above "Internet" below
circle radius 100% with .w at last arrow.e "Alice"
arrow right 100%
box width 120% height 120% "Decryption" "with Alice's" "private key"
```

Now, let's say, we have Charles spying on our two lovers:

```pikchr
circle "Bob" 
arrow right 250% "I love you <3" above
Encryption: box width 120% height 120% "Encryption" "with Alice's" "public key"
arrow right 350% "spq349832uç*%&2(Z*48" above "Internet" below
circle radius 100% with .w at last arrow.e "Alice"
arrow right 100%
box width 120% height 120% "Decryption" "with Alice's" "private key"


Charles: circle radius 120% "Charles" at 1/2 of the way between Encryption and Alice.n + (0, -2)
arrow from Charles to 3/4 of the way between Encryption and Alice chop

text height 120% width 250% "Can see encrypted message" "but can't decrypt it" with .n at Charles.s
```

Charles will never be able to eavesdrop on Bob and Alice unless he gets access to Alice's private key. But how is that mathematically possible? Because humans are not clever enough at the moment.

## Prime numbers

You are probably used to integers (whole numbers), but did you know some of them are _special_? The two most basic groups of integers are even ($2$,$4$,$6$,...) and odd ($3$,$5$,$7$,...) numbers. However, some of these numbers are even more special: they cannot be divided into a smaller whole number other than themselves! As small as this detail might seem, this is on what (pretty much) the whole current cryptography system relies on!

Machines are very bad at finding the divisors of a number (humans are even worse). For example, let's take $91$

$$
91 = 7 * 13
$$

We cannot divide $7$ and $13$ further down, that's because these are in fact prime numbers. Now let's say you have two **huge** prime numbers, like $1'066'340'417'491'710'595'814'572'169$ and $19'134'702'400'093'278'081'449'423'917$. Now multiply them together:

$$
1066340417491710595814572169 * 19134702400093278081449423917 = 
20'404'106'545'895'102'906'154'128'522'206'995'414'761'716'518'871'165'973 
$$

That's quite a big integer! If someone was given the final number and was asked to find the unique solution (the two prime numbers you multiplied together), this would be an impossible task.

<small>Well, in fact here I chose two [Fibonacci prime numbers](https://en.wikipedia.org/wiki/Fibonacci_prime) so it would be easier but anyways...</small>

The same goes for a computer, but with even larger numbers.

## Modulo

The modulo function also plays an important role in the RSA algorithm. Modulo can be seen as "wrapping around" when a number reaches a certain value. The most common example of this in everyday life is how we use clocks: After 12PM, the clocks "resets" at 1PM and so on at 12AM.

This can be mathematically written as:

$$
13 eq.triple 1 space (mod 12)
$$

We say that "$13$ is _congruent_ to $1$ modulo $12$", because

$$
13 = 1*12+1
$$

Generally speaking,

$$
a eq.triple b space (mod m) <==> a = k*m + b space (k in ZZ)
$$

## The RSA Algorithm

The procedure to generate the private ($n$, $d$) and public ($n$, $e$) keys is the following:

1. Choose two prime numbers (preferably big ones).
2. Compute $n = p*q$.
3. Compute $phi.alt(n) = (p-1) * (q-1)$.
    - This value comes from the fact that both $p$ and $q$ are prime, thus $phi.alt(p) = (p-1)$, and $phi.alt(p*q) = phi.alt(p) * phi.alt(q)$
4. Choose the encryption exponent $e$ so that it is prime with, and smaller than $phi.alt(n)$
5. Compute the decryption exponent $d$, the inverse of $e$ modulo $phi.alt(n)$, $d eq.triple e^(-1) (mod phi.alt(n))$
    - A quick and easy solution here is to use Euler's extended algorithm, which we know will work because $e < phi.alt(n)$ and is $e$ is prime to $phi.alt(n)$, which means $gcd(e, phi.alt(n)) = 1$
    - We then get $e*d + phi.alt(n)*y = 1 <==> d eq.triple e^(-1) (mod phi.alt(n))$

The alorithm's security relies on the following equivalence: $(m^e)^d eq.triple (mod n)$

We can now encrypt our message $C$ (clear) to $M$ (encrypted) with the following formula:

$$
C eq.triple M^e space (mod n)
$$

and decrypt $M$ to $C$ with:

$$
M eq.triple C^d space (mod n)
$$

You may now ask: "But these are numbers, I want to encrypt a text message!". Well, text is just an illusion (on your phone), as its characters are represented as numbers in the underlying system (see [UTF-8](https://en.wikipedia.org/wiki/UTF-8)). We can first transcode our text to numbers:

For simplicity, let's take each letter's position in the alphabet, starting from $1$:
"I luv u" becomes:

$i = 9$, $l = 12$, $u = 21$, $v = 22$, $u = 21$

Then we can encrypt each number separately and concatenate them to get our encrypted message.

Let's encrypt this message by hand !

1. We choose $p = bold(5)$ and $q = bold(13)$
2. $n = p * q = bold(65)$
3. $phi.alt(n) = phi.alt(65) = (p-1)*(q-1) = 4*12 = bold(48)$
4. Let's take $e = bold(5)$
5. We apply Euler's Extended algorithm for $phi.alt(n) = 48$ and $e = 5$ to find $d$
   1. $48 eq.triple 3 space (mod 5)$
   2. $5 eq.triple 2 space (mod 3)$
   3. $3 eq.triple 1 space (mod 2)$
   4. $2 eq.triple 0 space (mod 1)$
   - $gcd(48, 5)$ is effectively 1, we can find $48*x + 5*y = 1$ by simplifying the steps backwards:
   1. $1 = 3 - colred(2)*1$
   2. $colred(2) = 5 - 3*1 <==> 1 = 3 - colred((5-3*1))*1 <==> 1 = 2*colgreen(3) - 5$
   3. $colgreen(3) = 48 - 9*5 <==> 1 = 2 * colgreen((48-9*5)) - 5 <==> underline(48*2 + 5 * (-19) = 1)$
   - We have $d=x=-19$, but a modular inverse needs to be positive, so we add $48$: $-19+48=29 <==> underline(d = 29 eq.triple 5^(-1) (mod 48))$
   - Our keys are: $(n=65, d=29)$ and $(n=65, e=5)$
6. We can start out encrypting!
   1. $i = 9 ==> C eq.triple 9^5 space (mod 65) <==> 9^5 eq.triple underline(29) space space (mod 65)$
   2. $l = 12 ==> C eq.triple 12^5 space (mod 65) <==> 12^5 eq.triple underline(12) space space (mod 65)$
   3. $u = 21 ==> C eq.triple 15^5 space (mod 65) <==> 15^5 eq.triple underline(21) space space (mod 65)$
   4. $v = 22 ==> C eq.triple 22^5 space (mod 65) <==> 22^5 eq.triple underline(42) space space (mod 65)$

Our encrypted message is $[29, 12, 21, 42, 21]$

Let's now check if everything went well by decrypting it:

$$
29 ==> M eq.triple 29^29 (mod 65) <==> 29^29 eq.triple underline(9) space (mod 65)
$$

We did it!

## Attack Vectors

The RSA algorithm is not magic, and it can be broken if not implemented correctly. For instance, you may have noticed that the letter "u" has been encoded twice in the sentence, and the output remains the same. [Frequency analysis](https://en.wikipedia.org/wiki/Frequency_analysis) could be used here to guess letters from a longer text. To remedy this, we can use a technique called [padding](https://en.wikipedia.org/wiki/Padding_(cryptography)) or combine RSA with symmetric encryption, like [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard):

```pikchr
circle "Bob"
arrow right 250% "I love you <3" above
box width 150% height 120% "AES Encryption" "with a random" "symmetric key"
arrow right 350% "spq349832uç*%&2(Z*48" above "Clear key" below
box width 150% height 120% "RSA Encryption" "with Alice's" "public key"
arrow right 350% "spq349832uç*%&2(Z*48" above "Encrypted key" below
down
circle radius 100% with .w at last arrow.e "Alice"
arrow down 100%
box width 150% height 120% "RSA Decryption" "with Alice's" "private key"
arrow left 350% "spq349832uç*%&2(Z*48" above "Decrypted key" below from last box.w
box width 150% height 120% "AES Decryption" "with the" "decrypted key"
arrow left 50%
box width 150% height 120% "I love you <3"
```

Other attack vectors are a bit more complex, like [timing attacks](https://en.wikipedia.org/wiki/Timing_attack) or [a few others](https://en.wikipedia.org/wiki/RSA_(cryptosystem)#Attacks_against_plain_RSA).
This is why it is important to use a well-tested library to implement RSA, like [OpenSSL](https://www.openssl.org/).

## Proof using Fermat's little theorem

[Fermat's little theorem](https://en.wikipedia.org/wiki/Fermat%27s_little_theorem) states that if $p$ is a prime number and $a$ is an integer not divisible by $p$, then:

$$
a^(p-1) eq.triple 1 space (mod p)
$$

And we want to show that 

$$
(m^e)^d eq.triple m space (mod n)
$$

where $n = p*q$ with $p,q in PP$ and $e*d eq.triple 1 space (mod phi.alt(n))$ with $e,d in NN$.

This basically shows that encrypting and decrypting the same message gives us the original input by first applying the encryption exponent $e$ and then the decryption one $d$.

Since $e*d eq.triple 1 space (mod phi.alt(n)) <==> e*d = k*phi.alt(n) + 1$, we can rewrite $(m^e)^d$ as following:

$$
m^(e*d) = m^(k*n + 1) = m*m^(k*phi.alt(n)) = m * (m^phi.alt(n))^k
$$

$phi.alt(n)$ can be rewritten as $(p-1)*(q-1)$:

$$
m * (m^((p-1)*(q-1)))^k = m * (m^((p-1)))^((q-1)*k)
$$

If $m$ isn't divisible by both $p$ and $q$ (coprime to $n = p*q$), with Fermat's little theorem, we know that $m^(p-1) eq.triple 1 space (mod n)$ or $m^(q-1) eq.triple 1 space (mod n)$

We can then simply replace $m^(p-1)$:

$$
m * (m^((p-1)))^((q-1)*k) eq.triple^? m space (mod n) <==> m*1^((q-1)*k) eq.triple m (mod n)
$$

Now, if $m$ is divisible by $p$ or $q$, this means that:

$$
m eq.triple 0 space (mod p) <==> m^(e*d) eq.triple 0 space (mod p)
$$

and likewise for $q$:

$$
m eq.triple 0 space (mod q) <==> m^(e*d) eq.triple 0 space (mod q)
$$

The [Chinese Remainder Theorem](https://en.wikipedia.org/wiki/Chinese_remainder_theorem) tells us that:

$$
m^(e*d) eq.triple 0 space (mod p*q) <==> m^(e*d) eq.triple 0 space (mod n)
$$

And that's about it :smile:

## Conclusion

RSA is a fascinating algorithm that relies on the mathematical properties of prime numbers and modular arithmetic. It's a great example of how abstract mathematical concepts can be applied to solve real-world problems. 

If you're interested in learning more about RSA, I highly recommend diving into the details of the algorithm and trying to implement it yourself. It's a great way to deepen your understanding of cryptography and computer science in general.