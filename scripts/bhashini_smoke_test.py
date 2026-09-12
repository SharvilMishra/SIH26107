"""
Quick manual check that real Bhashini credentials actually work end to
end. Not part of the pytest suite (hits the live API) -- run by hand
after filling in BHASHINI_USER_ID / BHASHINI_API_KEY in .env:

    python -m scripts.bhashini_smoke_test
"""

from dotenv import load_dotenv

load_dotenv()

from app.services.bhashini_service import BhashiniService, BhashiniError  # noqa: E402


def main():
    service = BhashiniService()
    if not service.configured:
        print("BHASHINI_USER_ID / BHASHINI_API_KEY not set in .env -- nothing to test.")
        return

    text = "How do I check if a helmet has a valid BIS certification?"
    print(f"EN -> HI: {text!r}")
    try:
        hindi = service.translate(text, "en", "hi")
        print(f"  -> {hindi!r}")

        back = service.translate(hindi, "hi", "en")
        print(f"HI -> EN roundtrip: {back!r}")
    except BhashiniError as exc:
        print(f"Bhashini call failed: {exc}")


if __name__ == "__main__":
    main()
