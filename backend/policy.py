"""Customer-facing language safeguards derived from the repository policy bundle."""

import re

BOOKING_STATES = {
    "collecting",
    "tentative_request",
    "availability_hold",
    "awaiting_studio_confirmation",
    "awaiting_client_confirmation",
    "confirmed",
    "needs_human",
    "abandoned",
}

STATE_MESSAGES = {
    "collecting": "We are collecting the details of your request.",
    "tentative_request": "Your tentative request has been received for studio review.",
    "availability_hold": "The studio has placed a temporary availability hold; this is not a confirmed booking.",
    "awaiting_studio_confirmation": "Your request is awaiting studio confirmation.",
    "awaiting_client_confirmation": "The studio is awaiting your confirmation.",
    "confirmed": "Your booking is confirmed.",
    "needs_human": "A studio team member needs to review your request.",
    "abandoned": "This request is no longer active.",
}

_IMAGE_CONTEXT = re.compile(r"\b(image|images|photo|photos|gallery|portrait|appearance)\b", re.I)
_IMAGE_CHANGES = re.compile(
    r"\b(edit(?:ed|ing)?|retouch(?:ed|ing)?|enhanc(?:e|ed|ing)|alter(?:ed|ing)?|"
    r"manipulat(?:e|ed|ing)|correct(?:ed|ing)?|filter(?:ed|ing)?)\b",
    re.I,
)
_CONFIRMATION = re.compile(
    r"\b(booking|session|date)\b.{0,24}\b(confirmed|booked|secured|locked in|all set)\b",
    re.I,
)


def validate_customer_copy(text: str, state: str | None = None) -> list[str]:
    """Return scoped policy violations without banning ordinary record-edit language."""
    violations = []
    if _IMAGE_CONTEXT.search(text) and _IMAGE_CHANGES.search(text):
        violations.append("prohibited_image_change_language")
    if state != "confirmed" and _CONFIRMATION.search(text):
        violations.append("premature_confirmation_language")
    return violations
