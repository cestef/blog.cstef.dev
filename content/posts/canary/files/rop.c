#include <stdio.h>
#include <string.h>

void rop1()
{
    printf("ROP 1!\n");
}

void rop2()
{
    printf("ROP 2!\n");
}

void rop3()
{
    printf("ROP 3!\n");
}

void vulnerable()
{
    char buffer[16];
    puts("Enter some text: ");
    gets(buffer);
    printf("You entered: %s\n", buffer);
}

int main()
{
    vulnerable();
    return 0;
}