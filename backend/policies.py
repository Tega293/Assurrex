POLICIES = {
    "basic": {
        "name": "Basic Cover",
        "warranty_months": 12,
    },
    "standard": {
        "name": "Standard Cover",
        "warranty_months": 24,
    },
    "extended": {
        "name": "Extended Cover",
        "warranty_months": 36,
    },
}


def get_policy(policy_id):
    """Return one known policy or reject an unknown name."""
    policy = POLICIES.get(policy_id)

    if policy is None:
        raise ValueError(
            "Choose basic, standard, or extended as policy_id."
        )

    return policy