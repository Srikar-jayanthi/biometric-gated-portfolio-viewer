# Security Analysis & Architecture Document

This document outlines the security architecture, threat model, and countermeasures implemented in the Biometric-Gated Micro-Investment Portfolio tracking application. Security is a first-class citizen in this architecture, protecting sensitive user financial data (stock holdings) and verifying user identity at multiple levels.

---

## 1. Threat Model and Asset Identification

In a production fintech context, we identify the following critical assets:
- **User Credentials:** Plaintext email and passwords.
- **Session Tokens (JWTs):** Tokens that grant access to backend API procedures.
- **Portfolio and Holdings Data:** Records of user investments, which must remain private and tamper-proof.
- **Biometric Keys/Secrets:** Key materials used to unlock local access.

We design the application to defend against the following threat vectors:
1. **Physical Access / Device Loss:** An unauthorized user gains physical access to an unlocked device and opens the application.
2. **Network Sniffing / Man-in-the-Middle (MitM) Attacks:** Interception of API requests between the React Native client and the tRPC backend.
3. **Database Compromise:** Unauthorized reading of the database containing credentials and holdings.
4. **Server-Side API Exploitation:** Unauthorized access to API endpoints without proper authentication or spoofing identities.

---

## 2. Layered Defense Architecture

To address these threats, the application implements a layered security model combining **device-level biometrics**, **secure storage**, **stateless JWT sessions**, and **strong cryptography**.

### 2.1 Device-Level Biometric Authentication Gate
Biometric authentication (TouchID, FaceID, or Android Fingerprint/Face) protects the application from physical compromise. 
- **Decoupled Architecture:** The mobile app relies on the operating system's hardware-backed Secure Enclave or Keystore. The app requests authentication through `expo-local-authentication`, which prompts the OS-level UI. The application never directly handles or stores biometric data (fingerprint templates, facial geometry), eliminating the risk of biometric credential theft from our application.
- **Boot Gate:** On initial boot, the app verifies if a session token exists. If it does, a biometric challenge is forced. The main dashboard screen (`data-testid="portfolio-dashboard"`) is kept unrendered until the OS confirms a successful match.
- **Inactivity Timeout Re-Authentication:** If the application is backgrounded and remains in the background for more than 5 minutes (300 seconds), it automatically locks local access. When brought back to the foreground, it forces re-authentication and logs `RE_AUTH_TRIGGERED` to the console.

### 2.2 Secure Storage of Secrets
JWT session tokens are sensitive. Saving them to insecure local storage (such as standard React Native `AsyncStorage`) leaves them vulnerable to extraction via sandbox breakouts or debug access on rooted/jailbroken devices.
- **Countermeasure:** We use `expo-secure-store`. On iOS, this utilizes the Keychain Services API. On Android, it encrypts values using the Android Keystore system and stores them in SharedPreferences. This ensures that session credentials remain encrypted at rest.

### 2.3 Stateless Session Management with JWT
Backend authentication is stateless, reducing database load and eliminating session-hijacking state synchronization issues.
- **Signature Verification:** On login, the server issues a JSON Web Token signed with a strong secret key (`JWT_SECRET`) using the HMAC-SHA256 algorithm.
- **Protected Procedures:** All portfolio procedures (`holding.list`, `holding.add`, `holding.remove`) are protected by a tRPC middleware. The middleware extracts the `Authorization: Bearer <token>` header, verifies the signature, and rejects invalid requests with a tRPC `UNAUTHORIZED` error code.
- **Context Injection:** Once verified, the decrypted `userId` is injected into the request context. This ensures that users can only query or modify holdings belonging to their own user record (`where: { userId: ctx.session.userId }`), preventing Horizontal Privilege Escalation.

### 2.4 Server-Side Cryptography and Database Integrity
- **Password Hashing:** Storing passwords in plaintext or using weak hash algorithms (like MD5 or SHA1) is a critical vulnerability. We use `bcryptjs` to hash passwords with a work factor (salt rounds) of 10. Bcrypt incorporates a salt to protect against rainbow table attacks and is intentionally slow to resist brute-force hardware attacks.
- **SQL Injection Prevention:** Prisma ORM parameterizes all database queries by default. This makes it impossible for malicious input in procedures (such as tickers or emails) to execute arbitrary SQL commands.
- **Strict Input Validation:** We use `zod` to validate all incoming payloads to tRPC procedures, preventing buffer overflows, type confusion, or unexpected payloads.
