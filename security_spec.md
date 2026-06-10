# Firestore Security Specification & Invariance Rules

## 1. Data Invariants

Our neighborhood network revolves around mutual trust, non-negative point balances, and strict role/author boundaries.
We enforce the following core invariants at the database level:

1.  **Identity Bond**: Users can only create, update, or delete profiles, listings, and notifications that belong to them (where `authorId` or `userId` or document ID matches their authenticated Firebase Auth UID).
2.  **Point Conservation & Non-Negativity**: Points represent a community-bound currency. Users cannot edit their own point balances arbitrary; points are updated as part of Completed Exchange transactions. Points cannot be negative.
3.  **Strict State Transition Machine**: Exchanges must follow the exact lifecycle: `pendiente` -> `en_progreso` -> `completado` / `cancelado`. It is forbidden to skip steps (e.g., transition `pendiente` directly to `completado` without approval).
4.  **No Double Spending or Overrides**: Helper and requester confirmations must be logged correctly. The transition of an exchange to "completado" should require both parties' confirmations in a valid batch.
5.  **Data Type & String Enforcements**: All IDs and input fields must be size-constrained (e.g. titles under 100 characters, bios under 500 characters) to avoid database denial-of-wallet or resource consumption attacks.

---

## 2. The "Dirty Dozen" Rogue Payloads

These 12 malicious payloads attempt to violate security boundaries and must be rejected by the security rules:

### Column: users

#### 1. Identity Spoofing (Modifying another user's profile)
*   **Attack**: User `attacker-uid` attempts to update profile at `/users/victim-uid` to edit their bio or claim their points.
*   **Payload**: `{ name: 'Victim hacked', points: 9999 }`
*   **Expected**: `PERMISSION_DENIED` (auth.uid `attacker-uid` != doc ID `victim-uid`).

#### 2. Self-Assigned Points (Privilege escalation)
*   **Attack**: User `user-123` attempts to increase their own points by updating their profile.
*   **Payload**: `{ points: 1000 }`
*   **Expected**: `PERMISSION_DENIED` since users cannot modify their own point balances or roles directly unless validated.

---

### Column: posts

#### 3. Listing Hijacking (Updating another user's post)
*   **Attack**: User `attacker` attempts to modify or delete a listing created by `user-1` at `/posts/post-abc`.
*   **Payload**: `{ title: 'Hijacked title', description: 'Attack description' }`
*   **Expected**: `PERMISSION_DENIED` (listing `authorId` is immutable and must match the authenticated UID).

#### 4. Foreign Author Injection (Creating someone else's posting)
*   **Attack**: Authenticated user `attacker` attempts to write a post with `authorId` set to `victim`.
*   **Payload**: `{ id: 'post-123', authorId: 'victim', title: 'Need dog walker', type: 'necesito', status: 'abierto', category: 'mascotas', suggestedPoints: 3, isUrgent: false, locationLabel: 'Retiro', createdAt: '...', interestedUsers: [] }`
*   **Expected**: `PERMISSION_DENIED` (cannot write listing where `incoming().authorId != request.auth.uid`).

#### 5. Listing Value Poisoning (Denial of wallet via strings)
*   **Attack**: User attempts to flood the database with extremely long titles or invalid types to exhaust limits.
*   **Payload**: `{ title: 'A'.repeat(5000), suggestedPoints: -50 }`
*   **Expected**: `PERMISSION_DENIED` (title exceeds size constraints and points must be positive).

---

### Column: exchanges

#### 6. Double-Dealer Fraud (Creating self-involved exchanges)
*   **Attack**: User `user-1` attempts to initiate an exchange with themselves as both the requester and helper.
*   **Payload**: `{ id: 'exc-1', postId: '...', requesterId: 'user-1', helperId: 'user-1', status: 'pendiente' }`
*   **Expected**: `PERMISSION_DENIED` (helperId must be different from requesterId).

#### 7. State Forgery (Completing an exchange unconfirmed)
*   **Attack**: Helper attempts to jump/transition an exchange from `pendiente` directly to `completado` to illegally claim points.
*   **Payload**: `{ status: 'completado', requesterConfirmedComplete: false, helperConfirmedComplete: true }`
*   **Expected**: `PERMISSION_DENIED` (cannot set to completed without both confirmations set to true).

#### 8. Unauthorized Exchange Progress/Interception
*   **Attack**: Third-party attacker `user-999` attempts to set status of an exchange between `user-1` and `user-2` to `aceptado` or `cancelado`.
*   **Payload**: `{ status: 'aceptado' }`
*   **Expected**: `PERMISSION_DENIED` (the transaction belongs strictly to `user-1` or `user-2`; third-party write is unauthorized).

#### 9. Immutable ID Spoofing on Exchange
*   **Attack**: User attempts to switch the `postId` or original stakeholders inside an active exchange doc.
*   **Payload**: `{ postId: 'post-different', requesterId: 'user-attacker' }`
*   **Expected**: `PERMISSION_DENIED` (the core stakeholder IDs and post association are immutable).

---

### Column: notifications

#### 10. Notification Injection (Spamming another user)
*   **Attack**: User `attacker` attempts to create an in-app notification in `/notifications/notif-abc` targeted to `user-victim`.
*   **Payload**: `{ userId: 'user-victim', title: 'Hacked', message: 'You are hacked' }`
*   **Expected**: `PERMISSION_DENIED` (Notification creation must verify the creator has high privilege or matches expected transactional flow).

#### 11. Read Manipulation (Marking another user's notifier read)
*   **Attack**: User `attacker` attempts to modify the `read` status of `victim`'s notifications.
*   **Payload**: `{ read: true }` (at `/notifications/notif-victim`)
*   **Expected**: `PERMISSION_DENIED` (user can only update their own notifications).

---

### Column: global safety

#### 12. Path Variable Abuse (Junk character injection)
*   **Attack**: Malicious client attempts to write to a document with extremely large, toxic, or SQL-like wildcard IDs.
*   **Payload**: Writing to path `/users/SOME_*_WILDCARD_JUNK_CHARACTERS_#_MORE_THAN_128_CHARS...`
*   **Expected**: `PERMISSION_DENIED` (enforced via `isValidId()` check on string format, size, and characters).

---

## 3. Test Runner Design

The security assertions will be thoroughly evaluated against our Firestore rules compilation. Each of these "Dirty Dozen" operations will trigger `PERMISSION_DENIED` on the client. Our app handles Firestore errors by transforming them into robust JSON debug info.
