"""
Offline tests for BhashiniService -- mocks httpx so these run without
real Bhashini credentials or network access. For a live sanity check
against the real API, use scripts/bhashini_smoke_test.py instead.
"""

import httpx
import pytest

from app.services.bhashini_service import BhashiniService, BhashiniError, _pipeline_config_cache


CONFIG_RESPONSE = {
    "pipelineResponseConfig": [{"config": [{"serviceId": "ai4bharat/indictrans-v2"}]}],
    "pipelineInferenceAPIEndPoint": {
        "callbackUrl": "https://dhruva-api.bhashini.gov.in/services/inference/pipeline",
        "inferenceApiKey": {"name": "Authorization", "value": "test-inference-key"},
    },
}

COMPUTE_RESPONSE = {
    "pipelineResponse": [{"output": [{"source": "hello", "target": "namaste"}]}]
}


@pytest.fixture(autouse=True)
def _clear_cache():
    _pipeline_config_cache.clear()
    yield
    _pipeline_config_cache.clear()


def _mock_transport(config_status=200, compute_status=200):
    def handler(request: httpx.Request) -> httpx.Response:
        if "getModelsPipeline" in str(request.url):
            return httpx.Response(config_status, json=CONFIG_RESPONSE)
        return httpx.Response(compute_status, json=COMPUTE_RESPONSE)

    return httpx.MockTransport(handler)


def test_not_configured_without_credentials():
    service = BhashiniService(user_id="", api_key="")
    assert service.configured is False
    with pytest.raises(BhashiniError):
        service.get_pipeline_config("en", "hi")


def test_same_language_is_a_noop(monkeypatch):
    service = BhashiniService(user_id="u", api_key="k")
    # No network call should happen for source == target.
    assert service.translate("hello", "en", "en") == "hello"


def test_empty_text_is_a_noop():
    service = BhashiniService(user_id="u", api_key="k")
    assert service.translate("", "en", "hi") == ""
    assert service.translate("   ", "en", "hi") == "   "


def test_translate_happy_path(monkeypatch):
    service = BhashiniService(user_id="u", api_key="k")

    def fake_post(url, json=None, headers=None, timeout=None):
        with httpx.Client(transport=_mock_transport()) as client:
            return client.post(url, json=json, headers=headers)

    monkeypatch.setattr("app.services.bhashini_service.httpx.post", fake_post)

    result = service.translate("hello", "en", "hi")
    assert result == "namaste"

    # Second call for the same language pair should hit the cache, not
    # re-resolve the pipeline config.
    cached = service.get_pipeline_config("en", "hi")
    assert cached["service_id"] == "ai4bharat/indictrans-v2"


def test_config_call_failure_raises(monkeypatch):
    service = BhashiniService(user_id="u", api_key="k")

    def fake_post(url, json=None, headers=None, timeout=None):
        with httpx.Client(transport=_mock_transport(config_status=401)) as client:
            return client.post(url, json=json, headers=headers)

    monkeypatch.setattr("app.services.bhashini_service.httpx.post", fake_post)

    with pytest.raises(BhashiniError):
        service.translate("hello", "en", "hi")
