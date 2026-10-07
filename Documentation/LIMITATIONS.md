LIMITATIONS
NextWave AI & ML

1. Overview
AssureX Claim Engine is an academic/prototype implementation. These limitations describe restrictions present in the supplied project.

2. Synthetic Dataset
The machine-learning dataset is synthetically generated rather than collected from real-world warranty claims. Strong validation/test performance on synthetic data does not establish equivalent performance on real claims.

3. Illustrative Warranty Policies
Warranty policies are implemented as prototype rules in `backend/policies.py`. They are not connected to live manufacturer warranty databases.

4. Machine-Learning Generalisation
Real claims may contain products, faults, documents, histories, policies and evidence patterns not represented in the synthetic training data.

5. Model Performance
The project contains validation results approximately equal to:

• Logistic Regression: 0.915 macro F1
• Random Forest: 0.929 macro F1
• Extra Trees: 0.929 macro F1
These values were obtained from the project's synthetic dataset and should not be presented as production accuracy.

6. GTM Training Evidence
The exported Google Teachable Machine model exists in `backend/gtm_model/`, but the supplied archive does not contain complete evidence of the GTM training process.

7. Claim Summary Card Dataset
The project contains Claim Summary Card generation functionality, but the complete generated image dataset is not supplied.

8. Python vs GTM Comparison
The backend supports storing GTM probabilities and detecting disagreement, but the supplied archive does not contain the complete formal 30-unseen-claim comparison report. No completed 30-claim comparison result is claimed here.

9. Automated Testing
The archive does not contain a dedicated automated `tests/` suite. It contains manual helper scripts such as `try_claim.py`, `try_receipt.py`, `try_review.py`, and `check_invoices.py`.

10. Frontend Completeness
The React/Vite frontend contains the application structure but is not fully connected into a complete end-to-end production interface. Some pages remain scaffolding.

11. Database
The project uses SQLite and stores claim information and analysis information as JSON. This is suitable for a prototype but is not equivalent to a production-normalised, distributed claims database.

12. Database Scalability
SQLite is a local database technology. The current implementation does not provide a production-scale distributed database architecture.

13. OCR Limitations
OCR accuracy depends on document quality and structure. Blurry, low-resolution, poorly lit, damaged, handwritten or unusually formatted documents may produce inaccurate results.

14. OCR Platform Dependency
The OCR implementation contains a platform-specific Tesseract executable path. This must be configured when the application is moved to another operating system.

15. File Upload Limitations
The backend limits uploads to 10 MB and the OCR implementation limits PDF processing to three pages.

16. Authentication Limitations
The application includes member authentication and password hashing, but it does not implement the complete production-grade role model described in broader requirements.

17. Warranty Policy Management
Warranty policies are defined in Python code rather than independently versioned policy records. Policy changes therefore require code changes.

18. Deployment
The supplied project contains no deployment configuration. The documented execution process is local execution.

19. Production Security
The project includes security-related mechanisms such as password hashing, session authentication, HTTPOnly cookies, SameSite cookie configuration, upload limits, file-type validation, server-side feature derivation and GTM probability validation. It should nevertheless not be described as a complete production security implementation.

20. Real-World Data Privacy
The project uses synthetic claim data. Before real customer documents are processed, appropriate data-protection, access-control, retention, secure-storage, audit and deletion controls would be required.

21. Model Versioning
A saved model exists at `output/assurex_python_model.joblib`, but the archive does not provide a complete production model registry/version-management system.

22. Model Drift Monitoring
The project does not contain production monitoring for model drift, calibration, changing class distributions, long-term model performance or production disagreement rates.

23. Human Review Dependency
Claims involving unresolved evidence, missing information, duplicate evidence or contradictory dates may be routed for manual review. The system therefore does not attempt to automatically resolve every claim.

24. Claim Decision Limitation
The system is a prototype decision-support application. Its results should not be interpreted as legal or contractual determinations of warranty entitlement. Actual warranty decisions depend on the applicable warranty agreement, evidence and authorised human review.

25. Current Scope
The implemented project focuses on:

• Warranty claim intake
• Claim analysis
• Synthetic dataset generation
• Python machine learning
• Warranty rules
• OCR
• Duplicate detection
• SQLite persistence
• Manual review
• Claim Summary Cards
• GTM model integration
• React/Vite frontend structure
It does not implement live manufacturer warranty databases, payment processing, enterprise warranty integration or production claims adjudication.

26. Summary
The major limitations are synthetic training data, illustrative warranty rules, lack of complete real-world validation, incomplete GTM comparison/training evidence, absence of a complete automated test suite, partial frontend integration, SQLite persistence, hard-coded warranty policies, platform-specific OCR configuration, no deployment configuration, incomplete production-grade access control, and no production ML monitoring.

These limitations define the boundary between the supplied prototype and a production-grade warranty platform.