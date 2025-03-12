#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>

void function2(const char *msg)
{
    printf("Message: %s\n", msg);
}

void function3(int x, int y)
{
    char buf[100];
    snprintf(buf, sizeof(buf), "Values: %d, %d", x, y);
    function2(buf);
}

void function4(const char *filename)
{
    int fd = open(filename, O_RDONLY);
    if (fd != -1)
    {
        close(fd);
    }
}

void vuln(char *string)
{
    puts("Come get me");
    char buffer[20];
    strcpy(buffer, string);
}

int main()
{
    function2("Hello");
    function3(42, 99);
    function4("/tmp/test");

    char string[100];
    fgets(string, sizeof(string), stdin);
    vuln(string);
    return 0;
}