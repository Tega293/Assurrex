from getpass import getpass

import requests


BASE = "http://127.0.0.1:5000"
client = requests.Session()

username = input("Member username: ").strip()
password = getpass("Member password: ")

# Log in. Session keeps the login cookie for later requests.
response = client.post(
    BASE + "/api/auth/login",
    json={"username": username, "password": password},
)

print("Login:", response.status_code, response.json())

if response.status_code != 200:
    raise SystemExit("Login failed. Check your original password.")

# Show saved claims and their review status.
response = client.get(BASE + "/api/claims")
print("\nClaims:", response.status_code)

if response.status_code != 200:
    raise SystemExit(response.text)

for claim in response.json():
    print(
        "ID:", claim["id"],
        "| Recommendation:", claim["final_recommendation"],
        "| Review:", claim["review_status"],
    )

claim_id = int(input("\nEnter a Pending Manual Review claim ID: "))
decision = input("Decision (Approved or Rejected): ").strip()
note = input("Reason for your decision: ").strip()

response = client.post(
    BASE + f"/api/claims/{claim_id}/review",
    json={"decision": decision, "note": note},
)

print("\nReview:", response.status_code, response.json())

# Read the claim back immediately.
response = client.get(BASE + f"/api/claims/{claim_id}")
print("\nSaved claim:", response.status_code, response.json())