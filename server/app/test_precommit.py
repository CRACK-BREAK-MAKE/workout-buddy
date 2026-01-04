"""Test file with intentional issues for pre-commit."""


def bad_formatting(x: int, y: int) -> int:  # Missing type hints, bad spacing
    return x + y


# Missing newline at end of file
