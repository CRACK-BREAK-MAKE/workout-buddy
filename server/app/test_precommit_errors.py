"""Test file with formatting issues and syntax errors."""


def   badly_formatted(x,y):   # Bad spacing
    return x+y   # No spaces around operator


def another_function(  ):   # Extra spaces
    result=123    # No spaces, trailing spaces
    return result


# Syntax error below - missing colon after function definition
def broken_function(x, y)
    return x + y  # Missing colon above - SYNTAX ERROR


# Another syntax error - unclosed parenthesis
def another_broken(x, y):
    result = (x + y
    return result  # Unclosed parenthesis - SYNTAX ERROR
