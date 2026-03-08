#!/usr/bin/env python3
"""Block destructive file deletion commands and suggest using trash instead."""

import json
import re
import sys


def strip_quotes(command: str) -> str:
    """Remove quoted strings to avoid false positives on commands like echo 'rm test'."""
    # Remove double-quoted strings
    command = re.sub(r'"(?:[^"\\]|\\.)*"', '""', command)
    # Remove single-quoted strings (no escapes in single quotes)
    command = re.sub(r"'[^']*'", "''", command)
    return command


def contains_destructive_command(command: str) -> bool:
    """Check if command contains actual destructive commands (not in quotes)."""
    # Strip quoted content first
    stripped = strip_quotes(command)

    # Check for safe patterns first (git rm is fine)
    if re.search(r'\bgit\s+rm\b', stripped):
        return False

    # Patterns that indicate rm/shred/unlink being used as actual commands:
    # - At start of command
    # - After shell operators: &&, ||, ;, |, $(, `
    # - After sudo
    destructive_patterns = [
        r'(?:^|&&|\|\||;|\||\$\(|`)\s*rm\b',
        r'(?:^|&&|\|\||;|\||\$\(|`)\s*shred\b',
        r'(?:^|&&|\|\||;|\||\$\(|`)\s*unlink\b',
        r'\bsudo\s+rm\b',   # sudo rm is dangerous
        r'\bxargs\s+rm\b',  # xargs rm is dangerous
    ]

    for pattern in destructive_patterns:
        if re.search(pattern, stripped):
            return True

    return False


def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)  # Can't parse, allow through

    command = input_data.get('tool_input', {}).get('command', '')
    if not command:
        sys.exit(0)

    if contains_destructive_command(command):
        print(
            "BLOCKED: Do not use destructive file deletion commands "
            "(rm, shred, unlink). Use the 'trash' CLI instead:\n"
            "  - trash file.txt\n"
            "  - trash directory/\n\n"
            "If trash is not installed:\n"
            "  - macOS: brew install trash\n"
            "  - Linux/npm: npm install -g trash-cli\n\n"
            "This is a project policy per CLAUDE.md.",
            file=sys.stderr
        )
        sys.exit(2)

    sys.exit(0)

if __name__ == '__main__':
    main()
