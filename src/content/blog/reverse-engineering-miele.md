---
title: Reverse Engineering the TMS 220 Miele Payment System
tags: [reverse-engineering, miele, flipper-zero, ibutton]
description: A deep dive into the TMS 220 Miele payment system, how it works, and how I reverse-engineered it with a Flipper Zero.
date: 2024-08-29
state: seedling
---

The TMS 220 is a payment system used in Miele washing machines and dryers. It's a simple device that allows users to pay for laundry cycles using so-called "Touch" devices. These devices are essentially iButtons ([_sold for 40 bucks btw_](https://www.fust.ch/de/p/haushalt/waschmaschinen-und-waeschetrockner/zubehoer-waeschepflege/miele/benutzer-touch-91800158-8386593.html)) that can be loaded with credit and used to pay for laundry cycles.

![Miele TMS 220](/images/miele-tms-220.png)

As the payment device is completely independent (not connected via GSM or whatever), I was curious to see how it works and if I could reverse-engineer it. I happened to have just bought a [Flipper Zero](https://flipperzero.one/), which is basically a Swiss Army knife for nerds, and it seemed like the perfect device for the job as it supports iButton reading, writing, and emulation.

## _Touch_ Device

The _Touch_ device is a small iButton in a plastic holder. Underneath the plastic, there's a DS1992 iButton, which is a 1-wire device with 1Kb (128 bytes) of NVRAM. The device is powered by the reader, which provides power through the 1-wire interface.

![Miele Touch Device](/images/miele-touch-device.png)

It provides 4 pages of 32 bytes each, with an additional 32 bytes scratchpad (used for checking the data before actually writing it).

There are also 8 bytes of ROM that hold the following information:

| Address Range | Data                 |
| ------------- | -------------------- |
| `0x1`         | Family Code (`0x08`) |
| `0x2` - `0x7` | Serial Number        |
| `0x8`         | CRC byte             |

The 128 bytes of NVRAM were likely used to store the balance and other information about the user. This was the part I was most interested in, as I wanted to see if I could read and write the balance.

## Reverse Engineering

Getting into the actual reverse engineering, I started by reading the iButton with the Flipper Zero. The Flipper Zero has a built-in iButton reader, so it was as simple as putting the iButton on the reader and pressing a button. The Flipper Zero then displayed the contents of the iButton, which I saved on the SD card for later analysis.

The following dump was obtained from the iButton:

```ansi
[0m┌────────┬─────────────────────┬─────────────────────┬──────────┬──────────┐[0m
│[0;90m00000000[0m│ [0;31m20[0;33mc3 b1[0;31m08 01[0;33mc2 87[0;31m11[0m ┊ [0;31m0f[0;36m3e [0;31m07[0;36m24 [0;33mc399 c2bf[0m │ [0;31m [0;33m××[0;31m••[0;33m××[0;31m•[0m ┊ [0;31m•[0;36m>[0;31m•[0;36m$[0;33m××××[0m │[0m
│[0;90m00000010[0m│ [0;33mc2b2 [0;36m23[0;33mc2 93c3 b8c2[0m ┊ [0;33mb5[0;36m51 [0;33mc3bf [0;36m7b[0;33mc2 8cc2[0m │ [0;33m××[0;36m#[0;33m×××××[0m ┊ [0;33m×[0;36mQ[0;33m××[0;36m{[0;33m×××[0m │ [0m
│[0;90m00000020[0m│ [0;33mb8[0;36m4f [0;90m00[0;31m1e 1b[0;36m31 [0;33mc29d[0m ┊ [0;36m7e6e 6f37 [0;33mc28b [0;36m6f[0;33mc3[0m │ [0;33m×[0;36mO[0;90m•[0;31m••[0;36m1[0;33m××[0m ┊ [0;36m~no7[0;33m××[0;36mo[0;33m×[0m │[0m
│[0;90m00000030[0m│ [0;33ma2[0;31m13 [0;36m5e56 [0;31m1a[0;33mc2 98[0;31m03[0m ┊ [0;33mc2b9 c38a c3ae [0;36m6c[0;33mc3[0m │ [0;33m×[0;31m•[0;36m^V[0;31m•[0;33m××[0;31m•[0m ┊ [0;33m××××××[0;36ml[0;33m×[0m │[0m
│[0;90m00000040[0m│ [0;33m99[0;36m23 [0;33mc2af [0;31m17[0;36m51 [0;33mc2b5[0m ┊ [0;33mc381 c3a2 c3a7 c391[0m │ [0;33m×[0;36m#[0;33m××[0;31m•[0;36mQ[0;33m××[0m ┊ [0;33m××××××××[0m │ [0m
│[0;90m00000050[0m│ [0;36m32[0;33mc3 adc2 a0[0;36m73 6359[0m ┊ [0;33mc3ae c3b8 [0;31m0e[0;90m00 0000[0m │ [0;36m2[0;33m××××[0;36mscY[0m ┊ [0;33m××××[0;31m•[0;90m•••[0m │ [0m
│[0;90m00000060[0m│ [0;90m0000 [0;31m1105 12[0;90m00 0000[0m ┊ [0;36m454c 4549 4d[0;31m09 [0;36m3565[0m │ [0;90m••[0;31m•••[0;90m•••[0m ┊ [0;36mELEIM[0;31m_[0;36m5e[0m │ [0m
│[0;90m00000070[0m│ [0;33mc2ac [0;36m2b4a [0;31m1d[0;33mc2 b8[0;36m2b[0m ┊ [0;33mc3ad [0;31m0c[0;33mc3 8b[0;36m7b 5e6b[0m │ [0;33m××[0;36m+J[0;31m•[0;33m××[0;36m+[0m ┊ [0;33m××[0;31m_[0;33m××[0;36m{^k[0m │ [0m
│[0;90m00000080[0m│ [0;36m484c 6a26 [0;33mc389 [0;36m6a[0;33mc3[0m ┊ [0;33maac2 adc3 b4c2 9a[0;36m57[0m │ [0;36mHLj&[0;33m××[0;36mj[0;33m×[0m ┊ [0;33m×××××××[0;36mW[0m │ [0m
│[0;90m00000090[0m│ [0;33mc384 [0;36m54[0;33mc2 9b[0;31m05 [0;33mc2bf[0m ┊ [0;31m18[0;90m00 0000 0000 0000[0m │ [0;33m××[0;36mT[0;33m××[0;31m•[0;33m××[0m ┊ [0;31m•[0;90m•••••••[0m │ [0m
│[0;90m000000a0[0m│ [0;90m0000 0000 0000 0000[0m ┊ [0;90m00                 [0m │ [0;90m••••••••[0m ┊ [0;90m•       [0m │ [0m
└────────┴─────────────────────┴─────────────────────┴──────────┴──────────┘[0m
```

We immediately notice the `ELEIM` string, which is just `MIELE` reversed. This tells us that the iButton NVRAM is (likely) not encrypted, as the string is stored in plain text.

<!-- ```ansi
[0m┌────────┬─────────────────────┬─────────────────────┬──────────┬──────────┐[0m
│[0;90m00000000[0m│ [0;90m0000 0000 0000 0000[0m ┊ [0;90m0000 0000 0000 0000[0m │ [0;90m••••••••[0m ┊ [0;90m••••••••[0m │[0m
│[0;90m00000010[0m│ [0;31m18[0;33mc2 bf[0;31m05 [0;33mc29b [0;36m54[0;33mc3[0m ┊ [0;33m84[0;36m57 [0;33mc29a c3b4 c2ad[0m │ [0;31m•[0;33m××[0;31m•[0;33m××[0;36mT[0;33m×[0m ┊ [0;33m×[0;36mW[0;33m××××××[0m │[0m
│[0;90m00000020[0m│ [0;33mc3aa [0;36m6a[0;33mc3 89[0;36m26 6a4c[0m ┊ [0;36m486b 5e7b [0;33mc38b [0;31m0c[0;33mc3[0m │ [0;33m××[0;36mj[0;33m××[0;36m&jL[0m ┊ [0;36mHk^{[0;33m××[0;31m_[0;33m×[0m │[0m
│[0;90m00000030[0m│ [0;33mad[0;36m2b [0;33mc2b8 [0;31m1d[0;36m4a 2b[0;33mc2[0m ┊ [0;33mac[0;36m65 35[0;31m09 [0;36m4d49 454c[0m │ [0;33m×[0;36m+[0;33m××[0;31m•[0;36mJ+[0;33m×[0m ┊ [0;33m×[0;36me5[0;31m_[0;36mMIEL[0m │[0m
│[0;90m00000040[0m│ [0;36m45[0;90m00 0000 [0;31m1205 11[0;90m00[0m ┊ [0;90m0000 0000 [0;31m0e[0;33mc3 b8c3[0m │ [0;36mE[0;90m•••[0;31m•••[0;90m•[0m ┊ [0;90m••••[0;31m•[0;33m×××[0m │ [0m
│[0;90m00000050[0m│ [0;33mae[0;36m59 6373 [0;33mc2a0 c3ad[0m ┊ [0;36m32[0;33mc3 91c3 a7c3 a2c3[0m │ [0;33m×[0;36mYcs[0;33m××××[0m ┊ [0;36m2[0;33m×××××××[0m │[0m
│[0;90m00000060[0m│ [0;33m81c2 b5[0;36m51 [0;31m17[0;33mc2 af[0;36m23[0m ┊ [0;33mc399 [0;36m6c[0;33mc3 aec3 8ac2[0m │ [0;33m×××[0;36mQ[0;31m•[0;33m××[0;36m#[0m ┊ [0;33m××[0;36ml[0;33m×××××[0m │[0m
│[0;90m00000070[0m│ [0;33mb9[0;31m03 [0;33mc298 [0;31m1a[0;36m56 5e[0;31m13[0m ┊ [0;33mc3a2 [0;36m6f[0;33mc2 8b[0;36m37 6f6e[0m │ [0;33m×[0;31m•[0;33m××[0;31m•[0;36mV^[0;31m•[0m ┊ [0;33m××[0;36mo[0;33m××[0;36m7on[0m │[0m
│[0;90m00000080[0m│ [0;36m7e[0;33mc2 9d[0;36m31 [0;31m1b1e [0;90m00[0;36m4f[0m ┊ [0;33mc2b8 c28c [0;36m7b[0;33mc3 bf[0;36m51[0m │ [0;36m~[0;33m××[0;36m1[0;31m••[0;90m•[0;36mO[0m ┊ [0;33m××××[0;36m{[0;33m××[0;36mQ[0m │[0m
│[0;90m00000090[0m│ [0;33mc2b5 c3b8 c293 [0;36m23[0;33mc2[0m ┊ [0;33mb2c2 bfc3 99[0;36m24 [0;31m07[0;36m3e[0m │ [0;33m××××××[0;36m#[0;33m×[0m ┊ [0;33m×××××[0;36m$[0;31m•[0;36m>[0m │[0m
│[0;90m000000a0[0m│ [0;31m0f11 [0;33mc287 [0;31m0108 [0;33mc3b1[0m ┊ [0;31m200a               [0m │ [0;31m••[0;33m××[0;31m••[0;33m××[0m ┊ [0;31m _      [0m │[0m
└────────┴─────────────────────┴─────────────────────┴──────────┴──────────┘[0m
``` -->

At the time of this dump, there was no balance on this iButton, so it was near impossible to determine where the balance was stored. We needed another dump with an amount on it to perform a differential analysis.

## Getting another dump

TODO