"""
Bhashini (Digital India / MeitY) translation service -- Phase 5 (multilingual).

Bhashini's pipeline API is a two-call flow, not a single "translate"
endpoint:

  1. Pipeline Config Call (`getModelsPipeline`) -- tells Bhashini which
     task (translation) and language pair you want. It replies with a
     `serviceId` for that pair AND a per-integrator callback URL +
     inference auth header to use for step 2. We cache this per
     (source, target) pair so every chat message doesn't re-resolve it.
  2. Pipeline Compute Call -- POST the actual text to the callback URL
     from step 1, using its auth header. This is what actually
     translates.

Docs: https://bhashini.gitbook.io/bhashini-apis
Only text translation (NMT) is wired up here, since that's all the chat
flow needs -- ASR/TTS would follow the same config-then-compute shape if
ever added (add "asr"/"tts" to pipelineTasks in get_pipeline_config).
"""

from __future__ import annotations

import threading
from typing import Any

import httpx

from app.core.config import (
    BHASHINI_USER_ID,
    BHASHINI_API_KEY,
    BHASHINI_PIPELINE_ID,
    BHASHINI_CONFIG_URL,
)

_CACHE_LOCK = threading.Lock()
_pipeline_config_cache: dict[tuple[str, str], dict[str, Any]] = {}


class BhashiniError(RuntimeError):
    """Raised on any failure talking to Bhashini (bad creds, network,
    unexpected response shape, unsupported language pair, etc.). Callers
    should catch this and fall back gracefully rather than 500ing the
    chat endpoint over a translation hiccup."""


class BhashiniService:
    def __init__(
        self,
        user_id: str | None = None,
        api_key: str | None = None,
        pipeline_id: str | None = None,
    ):
        self.user_id = user_id or BHASHINI_USER_ID
        self.api_key = api_key or BHASHINI_API_KEY
        self.pipeline_id = pipeline_id or BHASHINI_PIPELINE_ID

    @property
    def configured(self) -> bool:
        """False when creds aren't set -- callers use this to skip
        translation entirely instead of raising on every request."""
        return bool(self.user_id and self.api_key)

    # ------------------------------------------------------------------
    # Step 1: Pipeline Config Call
    # ------------------------------------------------------------------
    def get_pipeline_config(self, source_lang: str, target_lang: str) -> dict[str, Any]:
        cache_key = (source_lang, target_lang)
        with _CACHE_LOCK:
            cached = _pipeline_config_cache.get(cache_key)
        if cached:
            return cached

        if not self.configured:
            raise BhashiniError(
                "BHASHINI_USER_ID / BHASHINI_API_KEY not set -- get both from "
                "the Bhashini Udyat dashboard, My Profile -> API Keys."
            )

        payload = {
            "pipelineTasks": [
                {
                    "taskType": "translation",
                    "config": {
                        "language": {
                            "sourceLanguage": source_lang,
                            "targetLanguage": target_lang,
                        }
                    },
                }
            ],
            "pipelineRequestConfig": {"pipelineId": self.pipeline_id},
        }
        headers = {
            "Content-Type": "application/json",
            "userID": self.user_id,
            "ulcaApiKey": self.api_key,
        }

        try:
            resp = httpx.post(BHASHINI_CONFIG_URL, json=payload, headers=headers, timeout=15)
        except httpx.HTTPError as exc:
            raise BhashiniError(f"Could not reach Bhashini config endpoint: {exc}") from exc

        if resp.status_code != 200:
            raise BhashiniError(
                f"Pipeline config call failed ({resp.status_code}) for "
                f"{source_lang}->{target_lang}: {resp.text[:300]}"
            )

        data = resp.json()
        try:
            service_id = data["pipelineResponseConfig"][0]["config"][0]["serviceId"]
            endpoint = data["pipelineInferenceAPIEndPoint"]
            callback_url = endpoint["callbackUrl"]
            auth_name = endpoint["inferenceApiKey"]["name"]
            auth_value = endpoint["inferenceApiKey"]["value"]
        except (KeyError, IndexError, TypeError) as exc:
            raise BhashiniError(
                f"Unexpected pipeline config response shape for "
                f"{source_lang}->{target_lang}: {data}"
            ) from exc

        resolved = {
            "service_id": service_id,
            "callback_url": callback_url,
            "auth_header": {auth_name: auth_value},
        }
        with _CACHE_LOCK:
            _pipeline_config_cache[cache_key] = resolved
        return resolved

    # ------------------------------------------------------------------
    # Step 2: Pipeline Compute Call
    # ------------------------------------------------------------------
    def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        """Translate `text` from source_lang to target_lang (ISO-639
        codes, e.g. 'en', 'hi', 'ta'). Returns `text` unchanged for
        empty input or a same-language no-op. Raises BhashiniError on
        any failure -- callers decide the fallback (usually: keep the
        untranslated text rather than break the chat response)."""
        if not text or not text.strip():
            return text
        if source_lang == target_lang:
            return text

        config = self.get_pipeline_config(source_lang, target_lang)

        body = {
            "pipelineTasks": [
                {
                    "taskType": "translation",
                    "config": {
                        "language": {
                            "sourceLanguage": source_lang,
                            "targetLanguage": target_lang,
                        },
                        "serviceId": config["service_id"],
                    },
                }
            ],
            "inputData": {"input": [{"source": text}]},
        }
        headers = {"Content-Type": "application/json", **config["auth_header"]}

        try:
            resp = httpx.post(config["callback_url"], json=body, headers=headers, timeout=15)
        except httpx.HTTPError as exc:
            raise BhashiniError(f"Could not reach Bhashini compute endpoint: {exc}") from exc

        if resp.status_code != 200:
            # A stale cached config (e.g. rotated inference key) is the
            # most common cause of a sudden failure here -- drop the
            # cache entry so the next call re-resolves it.
            with _CACHE_LOCK:
                _pipeline_config_cache.pop((source_lang, target_lang), None)
            raise BhashiniError(
                f"Pipeline compute call failed ({resp.status_code}) for "
                f"{source_lang}->{target_lang}: {resp.text[:300]}"
            )

        data = resp.json()
        try:
            return data["pipelineResponse"][0]["output"][0]["target"]
        except (KeyError, IndexError, TypeError) as exc:
            raise BhashiniError(
                f"Unexpected pipeline compute response shape: {data}"
            ) from exc
