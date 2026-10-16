#!/usr/bin/env python3
"""Copy the previously published demo assets into a new Pages site tree."""

from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen


BASE_URL = "https://jpeckenpaugh.github.io/game-pending/demos/latest/"
DESTINATION = Path("_site/demos/latest")
ASSETS = {
    "demo.webm": "video/webm",
    **{f"{name}.png": "image/png" for name in (
        "01-title", "02-customized-title", "03-game-start", "04-movement",
        "05-fired", "06-resumed", "07-power-choice", "08-customize-options",
    )},
    **{f"gallery/{name}.png": "image/png" for name in (
        "title", "options", "choose-power", "original", "emoji", "farm", "robot",
    )},
}


def preserve_asset(name: str, expected_type: str) -> None:
    request = Request(f"{BASE_URL}{name}", headers={"Cache-Control": "no-cache"})
    try:
        with urlopen(request, timeout=45) as response:
            content_type = response.headers.get_content_type()
            if content_type != expected_type:
                raise RuntimeError(
                    f"Unexpected content type for {name}: {content_type} (expected {expected_type})"
                )
            destination = DESTINATION / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            with destination.open("wb") as output:
                while chunk := response.read(1024 * 1024):
                    output.write(chunk)
        print(f"Preserved {name}")
    except HTTPError as error:
        if error.code == 404:
            print(f"No previously published {name}; skipping")
            return
        raise


if __name__ == "__main__":
    DESTINATION.mkdir(parents=True, exist_ok=True)
    for asset, media_type in ASSETS.items():
        preserve_asset(asset, media_type)
