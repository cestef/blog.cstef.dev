void vulnerable_function()
{
    char buffer[16];
    printf("Enter some text: ");
    gets(buffer); // Vulnerable function
    printf("You entered: %s\n", buffer);
}

int main()
{
    vulnerable_function();
    return 0;
}