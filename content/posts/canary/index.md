+++
title = "From Stack Canary to Rotisserie Chicken"
description = "Everything you need to know about stack canaries, and how to bypass them."
date = 2025-03-07
draft = true
[taxonomies]
tags = ["pwn"]
+++



Imagine this: you're about to start a pwn chall, so you run `rabin2`, thinking "this is going to be easy". Then you see it:

```ansi
❯ rabin2 -I main
[2march     x86
[2mbaddr    0x0
[2mbinsz    14120
[2mbintype  elf
[2mbits     64
[1mcanary   [32mtrue[0m
```

You're starting to sweat. Your hands are shaking. You're thinking about giving up already.

But don't worry, I got you covered. In this post, I'll explain everything you need to know about stack canaries, and how to bypass them. Let's get started!

## Stack Smashing 101

Before we dive into stack canaries, let's talk about stack smashing. Stack smashing is a type of vulnerability that occurs when a program writes beyond the bounds of a buffer on the stack. This can lead to all sorts of bad things happening, like overwriting the return address of a function, or corrupting other important data on the stack.

_Stop bothering me with the basics, go to [the cool stuff](#canary-roasting)._

<details>
<summary>What is the stack?</summary>

The stack is a region of memory that is used to store local variables, function arguments, and return addresses for function calls. It most commonly grows downwards, meaning that the top of the stack is at a lower memory address than the bottom of the stack.

As with a real pile of plates, the stack is a last-in, first-out (LIFO) data structure. This means that the last thing that was put on the stack is the first thing that gets taken off.

```ansi
┌──────────────┐
│ [2m# max addr [0m  │ <---[0m [2m# lowest address[0m
├──────────────┤
│ [2m....[0m         │
├──────────────┤
│ 0x20 [2m# last[0m  │
├──────────────┤
│ 0x28         │
├──────────────┤
│ [2m....[0m         │
├──────────────┤
│ 0x50 [2m# first[0m │
└──────────────┘
```

Data is appended to the stack by `PUSH`-ing it onto the stack, and removed by `POP`-ing it off the stack. The stack pointer (`rsp` on x86-64) keeps track of the current top of the stack.

```ansi
  [2m# t.o.s.[0m
┌───────────┐ [1mPUSH x2[0m  ┌───────────┐ [1mPOP x1[0m  ┌───────────┐ 
│ 0x20 [2m#rsp[0m │ ───────► │ 0x18 [2m#rsp[0m │ ──────► │ 0x19 [2m#rsp[0m │ 
├───────────┤          ├───────────┤         ├───────────┤ 
│ [2m....[0m      │          │ 0x19      │         │ 0x20      │ 
├───────────┤          ├───────────┤         ├───────────┤ 
│ 0x48      │          │ 0x20      │         │ [2m....[0m      │ 
├───────────┤          ├───────────┤         ├───────────┤ 
│ 0x50      │          │ [2m....[0m      │         │ 0x48      │ 
└───────────┘          ├───────────┤         ├───────────┤ 
  [2m# b.o.s.[0m             │ 0x48      │         │ 0x50      │ 
                       ├───────────┤         └───────────┘ 
                       │ 0x50      │                       
                       └───────────┘                                       
```

<p align="center"><small>t.o.s. = top of stack, b.o.s. = bottom of stack</small></p>
</details>

When we enter a function, a new stack frame is created for it. This stack frame contains the function's local variables, arguments, and return address. The return address is the address of the instruction that the program should jump to when it's done with the function.

Let's take a look at an example:

```c, copy, name=stack.c, include=files/stack.c
```

```bash, copy
gcc -S -masm=intel -o stack.s stack.c
```

Which produces the following assembly:

```asm, name=stack.s, include=files/stack.s
```

Let's start out with the registers:

- `rbp` (base pointer): Points to the base of the current stack frame.
- `rsp` (stack pointer): Points to the top of the stack.
- `edi` (destination index): The first argument to a function.
- `eax` (accumulator): The return value of a function.

You may also have noticed that two things are stored with negative offsets from `rbp`:

- Local variables (closest to `rbp`, e.g. `b`).
- Arguments (right below local variables, e.g. `a`).

An other important thing to note is that the return address is stored on the stack, right above the base pointer.

```ansi
 [2m# top of stack[0m    ◄─── [2m# low mem. addr[0m                      
┌───────────────┐                      
│ [2m# variables[0m   │ 
├───────────────┤                      
│ [2m# frame ptr[0m   │                      
├───────────────┤                      
│ [2m# return addr[0m │                      
├───────────────┤                      
│ [2m# (arguments)[0m │ 
└───────────────┘                      
 [2m# bot. of stack[0m   ◄─── [2m# high mem. addr[0m                     
```

### Let's start breaking stuff

Now that we know how the stack works, let's see what happens when we smash it.

```c, copy, name=vuln.c, include=files/vuln.c
```

```bash, copy
gcc -fno-stack-protector -no-pie -z execstack -o vuln vuln.c
# vuln.c: warning: the `gets' function is dangerous and should not be used.
```

<small>What? I know what I'm doing, gcc.</small>

Let's start out by being a good citizen and running the program as intended:

```bash
❯ ./vuln
Enter some text: uhm hey
You entered: uhm hey
```

Now let's scream our lungs out:

```bash
❯ ./vuln
Enter some text: AAAAAAAAAAAAAAAAAAAAAAAA
Segmentation fault
```

What happened here? Let's spin up `radare2` and take a look at the stack:

```bash
r2 -d -AA ./vuln
```

```ansi
[38;5;178m[0x7ffff7fe5a50]> [39mdc
Enter some text: AAAAAAAAAAAAAAAAAAAAAAAA
You entered: AAAAAAAAAAAAAAAAAAAAAAAA
[+] SIGNAL 11 errno=0 addr=0x00000000 code=128 si_pid=0 ret=0
[38;5;178m[0x00401180]> [39mdr
[38;5;75mrax = 0x00000044
[38;5;75mrbx = 0x7fffffffe498
rcx = 0x00000000
rdx = 0x00000000
[38;5;75mr8 = 0x004056e7
[38;5;75mr9 = 0x00000073
r10 = 0x00000000
[38;5;75mr11 = 0x00000202
r12 = 0x00000000
[38;5;75mr13 = 0x7fffffffe4a8
[38;5;75mr14 = 0x00403e00
[38;5;75mr15 = 0x7ffff7ffd020
[38;5;75mrsi = 0x004052a0
[38;5;75mrdi = 0x7fffffffde00
[38;5;75mrsp = 0x7fffffffe378
[38;5;75mrbp = 0x4141414141414141
[38;5;75mrip = 0x00401180
[38;5;75mrflags = 0x00010202
[38;5;75morax = 0xffffffffffffffff
```

We notice that the base pointer `rbp` has been overwritten with `0x4141414141414141` (ASCII `AAAAAAAA`). This is a clear sign that we've overwritten the stack frame of the function.

```ansi
 [2m# top of stack[0m    ◄─── [2m# low mem. addr[0m                      
┌────────────────────┐                                     
│ 0x4141414141414141 │ [2m# buffer[0m     |
│ 0x4141414141414141 │              |
├────────────────────┤              |          
│ 0x4141414141414141 │ [2m# saved rbp[0m  | [2m# overflow direction                   
├────────────────────┤              |          
│ 0x0x00401180       │ [2m# ret[0m        |                 
├────────────────────┤              |          
│        ....        │              ▼
└────────────────────┘                                     
 [2m# bot. of stack[0m   ◄─── [2m# high mem. addr[0m                     
```

Now what if we wanted to overwrite the return address of the function? This would allow us to redirect the program's execution to a different location in memory.

We start out by setting our breakpoint (`db`, **d**ebug **b**reakpoint) around the `gets` call; this way we can see the stack before and after the buffer overflow.

```ansi
[33m[0x7f26032e4a50]> [39ms main
[33m[0x00401181]> [39mpdf
        [31m; DATA XREF from entry0 @ 0x401064(r)
[36m┌ [39m21: int [31mmain [39m(int argc, char **argv, char **envp);
[36m│       [32m0x00401181      [33m55             [35mpush [36mrbp
[36m│       [32m0x00401182      [33m48[36m89e5         mov rbp[39m, [36mrsp
[36m│       [32m0x00401185      [36mb8[32m00000000     [36mmov eax[39m, [33m0
[36m│       [32m0x0040118a      [36me8a7[31mffffff     (B[0;1m[32mcall [36msym.vulnerable_function
(B[0m[36m│       [32m0x0040118f      [36mb8[32m00000000     [36mmov eax[39m, [33m0
[36m│       [32m0x00401194      [33m5d             [35mpop [36mrbp
[36m└       [32m0x00401195      [36mc3             [31mret
[33m[0x00401181]> [39mdb sym.vulnerable_function
[33m[0x00401181]> [39mdc
[33mINFO: [39mhit breakpoint at: 0x401136
[33m[0x00401136]> [39mpdf
        [36m;-- rip:
[39m        [31m; CALL XREF from main @ 0x40118a(x)
[36m┌ [39m75: [31msym.vulnerable_function [39m();
[36m│ [39mafv: vars(1:sp[0x18..0x18])
[36m│       (B[0;7m[32m0x00401136(B[0m b    [33m55             [35mpush [36mrbp
[36m│       [32m0x00401137      [33m48[36m89e5         mov rbp[39m, [36mrsp
[36m│       [32m0x0040113a      [33m48[36m83ec10       [33msub [36mrsp[39m, [33m0x10
[36m│       [32m0x0040113e      [33m48[36m8d05bf0e[32m..   [36mlea rax[39m, [36mstr.Enter_some_text: [31m; 0x402004 ; "Enter some text: "
[36m│       [32m0x00401145      [33m48[36m89c7         mov rdi[39m, [36mrax
[36m│[39m       [32m0x00401148      [36mb8[32m00000000     [36mmov eax[39m, [33m0                           
[36m│       [32m0x0040114d      [36me8defe[31mffff     (B[0;1m[32mcall [36msym.imp.printf(B[0m[31m         ; int printf(const char *format)
[36m│[39m       [32m0x00401152      [33m48[36m8d[33m45[36mf0       lea rax[39m, [[36mvar_10h[39m]
[36m│[39m       [32m0x00401156      [33m48[36m89c7         mov rdi[39m, [36mrax                         
[36m│[39m       [32m0x00401159      [36mb8[32m00000000     [36mmov eax[39m, [33m0                           
[36m│       [32m0x0040115e      [36me8ddfe[31mffff     (B[0;1m[32mcall [36msym.imp.gets(B[0m[31m           ; char *gets(char *s)
[36m│[39m       [32m0x00401163      [33m48[36m8d[33m45[36mf0       lea rax[39m, [[36mvar_10h[39m]
[36m│[39m       [32m0x00401167      [33m48[36m89c6         mov rsi[39m, [36mrax                         
[36m│       [32m0x0040116a      [33m48[36m8d05a50e[32m..   [36mlea rax[39m, [36mstr.You_entered:__s_n [31m; 0x402016 ; "You entered: %s\n"
[36m│[39m       [32m0x00401171      [33m48[36m89c7         mov rdi[39m, [36mrax                         
[36m│[39m       [32m0x00401174      [36mb8[32m00000000     [36mmov eax[39m, [33m0                           
[36m│       [32m0x00401179      [36me8b2fe[31mffff     (B[0;1m[32mcall [36msym.imp.printf(B[0m[31m         ; int printf(const char *format)
[36m│[39m       [32m0x0040117e      [36m90             [34mnop                                  
[36m│[39m       [32m0x0040117f      [36mc9             [35mleave                                
[36m└[39m       [32m0x00401180      [36mc3             [31mret                                  
[33m[0x00401136]> [39mdb 0x0040115e 0x00401163
```

<small>

`pdf` (**p**rint **d**isassembly **f**unction) shows us the disassembly of the current function.

</small>

Continuing the program, we can dump the stack with `pxQ @ rsp` (**p**rint he**x**adecimal **Q**uadwords at (**@**) the address in the **r**egister **sp**):

```ansi
[33m[0x00401136]> [39mdc
[33mINFO: [39mhit breakpoint at: 0x40115e
[33m[0x0040115e]> [39mpxQ @ rsp
0x7ffc47cd8ed0 [34m0x0000000000000000 [39msection.
0x7ffc47cd8ed8 [34m0x0000000000000000 [39msection.
0x7ffc47cd8ee0 [34m0x00007ffc47cd8ef0 [39mrbp+16
0x7ffc47cd8ee8 [34m0x000000000040118f [39mmain+14
0x7ffc47cd8ef0 [34m0x0000000000000001 [39msection.+1
0x7ffc47cd8ef8 [34m0x00007f260310224a
[39m0x7ffc47cd8f00 [34m0x0000000000000000 [39msection.
0x7ffc47cd8f08 [34m0x0000000000401181 [39mmain
[2m// ...
```

Remember, our stack grows downwards, so here the top of the stack is indeed at the top of the output. Decomposing the output:

| Address          | Value                | Description                     |
| ---------------- | -------------------- | ------------------------------- |
| `0x7ffc47cd8ed0` | `0x0000000000000000` | Local variable (`buffer`)       |
| `0x7ffc47cd8ed8` | `0x0000000000000000` | Local variable (`buffer`)       |
| `0x7ffc47cd8ee0` | `0x00007ffc47cd8ef0` | Saved base pointer (`push rbp`) |
| `0x7ffc47cd8ee8` | `0x000000000040118f` | Return address (`main`)         |

```ansi
[33m[0x0040115e]> [39mdc
Enter some text: AAAAAAAAAAAAAAAAAAAAAAAABBBBCCCCDDDDEEEEFFFF
[33mINFO: [39mhit breakpoint at: 0x401163
[33m[0x0040115e]> [39mpxQ @ rsp
0x7ffc47cd8ed0 [34m0x4141414141414141
[39m0x7ffc47cd8ed8 [34m0x4141414141414141
[39m0x7ffc47cd8ee0 [34m0x4141414141414141
[39m0x7ffc47cd8ee8 [34m0x4343434342424242
[39m0x7ffc47cd8ef0 [34m0x4545454544444444
[39m0x7ffc47cd8ef8 [34m0x00007f0046464646
[39m0x7ffc47cd8f00 [34m0x0000000000000000 [39msection.
0x7ffc47cd8f08 [34m0x0000000000401181 [39mmain
[2m// ...
```

No more `rbp` or return address. We've successfully overwritten the stack frame of the function. Also notice that the values are written "backwards" (little-endian).

### Baby steps

Let's modify our code a bit to make it easier to exploit. We'll add a function that spawns a shell, but we won't call it yet.

```c, copy, name=baby.c, include=files/baby.c
```

```bash, copy
gcc -fno-stack-protector -no-pie -z execstack -o baby baby.c
```

We indeed see that our shell function's `execve` and `/bin/sh` are present in the binary:

```ansi
[33m[0x7f9517f19a50]> [39mfs imports; f
0x00401030 6 sym.imp.printf
0x00401040 6 sym.imp.execve
0x00401050 6 sym.imp.gets
[33m[0x7f9517f19a50]> [39mrabin2 -z baby
[Strings]
nth paddr      vaddr      len size section type  string
―――――――――――――――――――――――――――――――――――――――――――――――――――――――
0   0x00002004 0x00402004 7   8    .rodata ascii /bin/sh
1   0x0000200c 0x0040200c 17  18   .rodata ascii Enter some text:
2   0x0000201e 0x0040201e 16  17   .rodata ascii You entered: %s\n
```

To make our life easier, we'll use `pwntools` to interact with the program.

```py, copy, name=baby.py, include=files/baby.py
```

```bash, copy
python3 baby.py
```

```ansi
[(B[0;1m[34m*(B[0m] '/home/cstef/code/blog.cstef.dev/content/posts/canary/files/baby'
    Arch:       amd64-64-little
    RELRO:      [33mPartial RELRO
[39m    Stack:      [31mNo canary found
[39m    NX:         [33mNX unknown - GNU_STACK missing
[39m    PIE:        [31mNo PIE (0x400000)
[39m    Stack:      [31mExecutable
[39m    RWX:        [31mHas RWX segments
[39m    Stripped:   [31mNo
[39m[(B[0;1m[32m+(B[0m] Starting local process './baby': pid 1055
[(B[0;1m[34m*(B[0m] Switching to interactive mode
Enter some text: You entered: AAAAAAAAAAAAAAAAAAAAAAAAF\x11@
(B[0;1m[31m$(B[0m whoami
cstef
```

The first `16 * 'A'` are to fill the buffer, and the `F\x11@` is the address of the `shell` function in little-endian.

ezpz, nothing too fancy.

### ROP-chains

Let's try chaining multiple ROPs together to sequentially call `rop1`, `rop2`, and `rop3`.

```c, copy, name=rop.c, include=files/rop.c
```

```bash, copy
gcc -fno-stack-protector -no-pie -z execstack -o rop rop.c
```

Let's lay out how our stack should look like in `vulnerable`:

```ansi
┌─────────────────────┐                  
│ [34m0x08[0m buffer         │ ◄───── [2m# rsp      
├─────────────────────┤                  
│ [34m0x10[0m buffer         │ |                
├─────────────────────┤ |                
│ [34m0x18[0m saved rbp      │ |                
├─────────────────────┤ | [2m# overflow dir.
│ [34m0x20[0m ret            │ |                
├─────────────────────┤ |                
│ ....                │ ▼                
└─────────────────────┘                  
```

> [!INFO]
> In glibc `2.34` and later, [`__libc_csu_init`](https://sourceware.org/legacy-ml/libc-alpha/2018-06/msg00717.html) has been removed. This used to contain the very useful `pop rdi` gadget that we're about to make extensive use of.

## Canary Roasting

## References and Further Reading

- **Offensive Security - Binary Exploitation**  
    Red Team Notes  
    [www.ired.team](https://www.ired.team/offensive-security/code-injection-process-injection/binary-exploitation)

- **Smashing The Stack For Fun And Profit**  
    Aleph One  
    [www-inst.eecs.berkeley.edu](https://inst.eecs.berkeley.edu/~cs161/fa08/papers/stack_smashing.pdf) <small>[PDF]</small>

- **Tut06: Return-oriented Programming (ROP)**  
    CS6265: Information Security Labra
    [tc.gts3.org](https://tc.gts3.org/cs6265/2019/tut/tut06-01-rop.html)

- **Return-Oriented Programming: Systems, Languages, and Applications**  
    Erik Buchanan, Ryan Roemer, Hovav Shacham, Stefan Savage  
    [hovav.net](https://hovav.net/ucsd/dist/rop.pdf) <small>[PDF]</small>
