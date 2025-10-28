Advisory ID: GHSA-mm7p-fcc7-pg87
Package: nodemailer
Impact: Email delivery to unintended domains (Interpretation Conflict)
Status: ⚙️ Reviewed — Not Exploitable in Dwello

Summary

This advisory reports a potential vulnerability where Nodemailer may send email to unintended recipient domains due to configuration interpretation conflicts.

Dwello Context

In the Dwello application, this advisory is not exploitable due to the following implementation safeguards:
	•	All outgoing verification and notification emails use static sender configurations.
	•	Recipient domains are deterministic and verified, not user-controlled or dynamically injected.
	•	The email sending logic does not allow arbitrary recipient input or unvalidated domains.

Resolution / Mitigation

No action is required at this time.
The Dwello team will continue to monitor the upstream Nodemailer repository and apply patches once an official fix becomes available.