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