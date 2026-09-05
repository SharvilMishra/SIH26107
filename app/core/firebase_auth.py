"""
Firebase Admin SDK setup + a FastAPI dependency for verifying Firebase ID
tokens the frontend sends on the Authorization header.

Not wired into any route yet -- nothing currently requires a signed-in
user. This is the plumbing so Settings/profile endpoints (and anything
else that should require auth) can add `Depends(get_current_user)` when
that work happens.

Credentials come from FIREBASE_SERVICE_ACCOUNT_JSON, a base64-encoded
service account JSON string set as an environment variable -- same
pattern as SUPABASE_KEY. Never commit the raw service account file.
"""

import base64
import json
import os

import firebase_admin
from fastapi import Header, HTTPException
from firebase_admin import auth as firebase_auth_sdk
from firebase_admin import credentials

_firebase_app = None


def _init_firebase():
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    encoded = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if not encoded:
        raise RuntimeError(
            "FIREBASE_SERVICE_ACCOUNT_JSON is not set. Generate a service "
            "account key from Firebase Console -> Project Settings -> "
            "Service Accounts -> Generate new private key, base64-encode "
            "the downloaded JSON file, and set it as this env var."
        )

    service_account_info = json.loads(base64.b64decode(encoded))
    cred = credentials.Certificate(service_account_info)
    _firebase_app = firebase_admin.initialize_app(cred)
    return _firebase_app


async def get_current_user(authorization: str = Header(None)) -> dict:
    """FastAPI dependency: verifies the Firebase ID token in the
    Authorization header and returns the decoded token (uid, email, etc).

    Usage on a route that should require sign-in:
        @router.get("/something")
        def something(user: dict = Depends(get_current_user)):
            uid = user["uid"]
            ...
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    id_token = authorization.removeprefix("Bearer ").strip()

    _init_firebase()
    try:
        decoded_token = firebase_auth_sdk.verify_id_token(id_token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {exc}")

    return decoded_token