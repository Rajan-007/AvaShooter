// Example fix for the yield return in try-catch issue
// Instead of this (which causes the error):
/*
private IEnumerator SomeCoroutine()
{
    try
    {
        // Some code
        yield return new WaitForSeconds(1f); // This causes CS1626 error
        // More code
    }
    catch (Exception e)
    {
        Debug.LogError(e);
    }
}
*/

// Do this instead:
private IEnumerator SomeCoroutine()
{
    bool shouldContinue = true;
    
    try
    {
        // Some code
        shouldContinue = true;
    }
    catch (Exception e)
    {
        Debug.LogError(e);
        shouldContinue = false;
    }
    
    if (shouldContinue)
    {
        yield return new WaitForSeconds(1f);
        
        try
        {
            // More code
        }
        catch (Exception e)
        {
            Debug.LogError(e);
        }
    }
}

// Alternative approach using a separate method:
private IEnumerator SomeCoroutine()
{
    yield return StartCoroutine(SafeCoroutine());
}

private IEnumerator SafeCoroutine()
{
    try
    {
        // Some code
        yield return new WaitForSeconds(1f);
        // More code
    }
    catch (Exception e)
    {
        Debug.LogError(e);
    }
}

