#include <stdio.h>
#include <string.h>
#include <stdlib.h>

void vulnerable_function(char *input)
{
    char buffer[64];
    // The canary value is placed here by the compiler between
    // the buffer and the return address

    printf("Buffer at: %p\n", buffer);
    printf("Input received: %s\n", input);

    // Vulnerable strcpy that doesn't check bounds
    strcpy(buffer, input);

    printf("Buffer content after copy: %s\n", buffer);
    // If the canary is corrupted, the program will terminate before reaching this point
}

int main(int argc, char *argv[])
{
    vulnerable_function(argv[1]);
    return 0;
}