void foo(int a)
{
    int b = a + 10; // Local variable
}

int main()
{
    foo(5); // A stack frame is created for foo
}