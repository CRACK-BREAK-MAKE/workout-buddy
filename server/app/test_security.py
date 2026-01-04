"""Test file to verify Bandit security checks."""

import os
import pickle
import subprocess


def insecure_password():
    """Bandit should catch hardcoded password."""
    password = "hardcoded_password_12345"  # B105: hardcoded_password_string
    api_key = "sk-1234567890abcdef"  # B105: hardcoded_password_string
    return password, api_key


def unsafe_yaml_load():
    """Bandit should catch unsafe YAML loading."""
    import yaml

    data = '!!python/object/apply:os.system ["echo hello"]'
    result = yaml.load(data)  # B506: yaml_load - unsafe
    return result


def sql_injection_risk(user_input: str):
    """Bandit should catch SQL injection risk."""
    query = f"SELECT * FROM users WHERE name = '{user_input}'"  # B608: hardcoded_sql_expressions
    return query


def shell_injection_risk(filename: str):
    """Bandit should catch shell injection."""
    os.system(f"cat {filename}")  # B605, B606, B607: shell injection
    subprocess.call(f"ls -la {filename}", shell=True)  # B602, B604: shell injection


def unsafe_pickle():
    """Bandit should catch pickle usage."""
    data = b"malicious data"
    obj = pickle.loads(data)  # B301: pickle usage
    return obj
