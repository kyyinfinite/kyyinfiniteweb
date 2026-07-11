import sys
import os
import platform
import hashlib
import json
import urllib.request
import urllib.error

LICENSE_API = "https://kyyinfinite.my.id/api/v1/license/verify"
ASSET_SLUG = "ganti-sesuai-slug-produk-ini"
LICENSE_KEY = os.environ.get("KYY_LICENSE_KEY", "PASTE_LICENSE_KEY_DISINI")


def get_fingerprint():
    raw = f"{platform.node()}-{platform.system()}-{platform.machine()}"
    return hashlib.sha256(raw.encode()).hexdigest()


def verify_license():
    payload = json.dumps({
        "licenseKey": LICENSE_KEY,
        "assetSlug": ASSET_SLUG,
        "fingerprint": get_fingerprint(),
    }).encode()

    request = urllib.request.Request(
        LICENSE_API,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            data = json.loads(response.read().decode())
    except urllib.error.HTTPError as error:
        data = json.loads(error.read().decode())
    except Exception as error:
        print(f"[kyyinfinite] Could not reach license server: {error}")
        sys.exit(1)

    if not data.get("valid"):
        print(f"[kyyinfinite] License check failed: {data.get('reason', 'unknown')}")
        print("Get a valid license at https://kyyinfinite.my.id")
        sys.exit(1)


verify_license()

# ==== kode script premium kamu mulai dari sini ====
