"""Test to verify Bandit catches security issues."""

import os

# Security issue 1: Hardcoded password (B105)
PASSWORD = "super_secret_password_123"


# Security issue 2: SQL injection risk (B608)
def get_user(username: str):
    query = f"SELECT * FROM users WHERE name = '{username}'"
    return query


# Security issue 3: Shell injection (B605, B607)
def run_command(filename: str):
    os.system(f"cat {filename}")
