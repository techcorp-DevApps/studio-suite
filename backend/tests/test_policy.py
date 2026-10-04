from policy import STATE_MESSAGES, validate_customer_copy


def test_scoped_image_policy_and_safe_record_language():
    assert "prohibited_image_change_language" in validate_customer_copy("Professionally retouched images")
    assert "prohibited_image_change_language" in validate_customer_copy("We provide an edited gallery")
    assert validate_customer_copy("Edit the client's contact record") == []


def test_booking_language_is_state_authoritative():
    assert "premature_confirmation_language" in validate_customer_copy("Your booking is confirmed", "tentative_request")
    assert validate_customer_copy("Your booking is confirmed", "confirmed") == []
    assert "confirmed" not in STATE_MESSAGES["tentative_request"].lower()
