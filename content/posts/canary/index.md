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
│ 0x19 [2m# last[0m  │
├──────────────┤
│ 0x20         │
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
│ 0x49      │          │ 0x20      │         │ [2m....[0m      │ 
├───────────┤          ├───────────┤         ├───────────┤ 
│ 0x50      │          │ [2m....[0m      │         │ 0x49      │ 
└───────────┘          ├───────────┤         ├───────────┤ 
  [2m# b.o.s.[0m             │ 0x49      │         │ 0x50      │ 
                       ├───────────┤         └───────────┘ 
                       │ 0x50      │                       
                       └───────────┘                                       
```
<p align="center"><small>t.o.s. = top of stack, b.o.s. = bottom of stack</small></p>
</details>

When we enter a function, a new stack frame is created for it. This stack frame contains the function's local variables, arguments, and return address. The return address is the address of the instruction that the program should jump to when it's done with the function.

Let's take a look at an example:

```c, copy
void foo(int a) {
    int b = a + 10; // Local variable
}

int main() {
    foo(5); // A stack frame is created for foo
}
```

```bash, copy
gcc -S -masm=intel -o stack.s stack.c
```

Which produces the following assembly:

```asm
foo:
    push  rbp                      ; save old base pointer
    mov   rbp, rsp                 ; rbp = rsp
    mov   DWORD PTR -20[rbp], edi  ; rbp[-20] = a (argument)
    mov   eax, DWORD PTR -20[rbp]  ; eax = rbp[-20] (a)
    add   eax, 10                  ; eax += 10
    mov   DWORD PTR -4[rbp], eax   ; rbp[-4] = eax (b)
    pop   rbp                      ; restore old base pointer
    ret

main:
    push  rbp       
    mov   rbp, rsp
    mov   edi, 5    ; argument to `foo`
    call  foo       ; call `foo(5)`
    mov   eax, 0    ; return 0
    pop   rbp
    ret
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

```c, copy
void vulnerable_function() {
    char buffer[16];
    printf("Enter some text: ");
    gets(buffer); // Vulnerable function
    printf("You entered: %s\n", buffer);
}

int main() {
    vulnerable_function();
    return 0;
}
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
Enter some text: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Segmentation fault
```

What happened here? Let's spin up `radare2` and take a look at the stack:

```bash
r2 -d -AA ./vuln
```

```ansi
[38;5;178m[0x7ffff7fe5a50]> [39mdc
Enter some text: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
You entered: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
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