#!/usr/bin/env python3
"""NeuralPath Python runner.

Executes a user's project script in a subprocess and reports the result as
JSON on stdout. Invoked from the Electron main process via the `python:run`
IPC handler (see electron/main.js).

Usage:
    python runner.py <script.py> [args...]   # run a user script
    python runner.py --selfcheck             # verify the ML stack is installed
"""
import json
import subprocess
import sys
import time


def selfcheck() -> dict:
    """Report which core packages are importable and their versions."""
    packages = ["numpy", "pandas", "matplotlib", "sklearn", "torch", "torchvision", "mlflow"]
    found = {}
    for name in packages:
        try:
            mod = __import__(name)
            found[name] = getattr(mod, "__version__", "unknown")
        except Exception as exc:  # noqa: BLE001 - report any import failure
            found[name] = f"MISSING ({exc.__class__.__name__})"
    return {"python": sys.version.split()[0], "packages": found}


def run_script(script_path: str, args: list[str]) -> dict:
    """Run a Python script, capturing stdout/stderr and timing it."""
    start = time.time()
    proc = subprocess.run(
        [sys.executable, script_path, *args],
        capture_output=True,
        text=True,
        timeout=600,
    )
    return {
        "stdout": proc.stdout,
        "stderr": proc.stderr,
        "exitCode": proc.returncode,
        "elapsed_secs": round(time.time() - start, 3),
    }


def main() -> None:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "no script provided"}))
        sys.exit(1)

    if sys.argv[1] == "--selfcheck":
        print(json.dumps(selfcheck(), indent=2))
        return

    try:
        result = run_script(sys.argv[1], sys.argv[2:])
    except subprocess.TimeoutExpired:
        result = {"stdout": "", "stderr": "Script timed out after 600s", "exitCode": -1}
    except Exception as exc:  # noqa: BLE001
        result = {"stdout": "", "stderr": str(exc), "exitCode": -1}

    print(json.dumps(result))


if __name__ == "__main__":
    main()
