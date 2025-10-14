# API Documentation

This document describes the server-side Cloud Functions API for Block Racers Online.

## Table of Contents
- [Authentication](#authentication)
- [Functions](#functions)
  - [submitTime](#submittime)
  - [awardCredits](#awardcredits)
  - [transferCredits](#transfercredits)
  - [purchaseCosmetic](#purchasecosmetic)
  - [saveLevel](#savelevel)
  - [getLeaderboard](#getleaderboard)

## Authentication

All Cloud Functions require the user to be authenticated via Firebase Authentication. Functions are called using the Firebase SDK:

```javascript
const functions = firebase.functions();
const result = await functions.httpsCallable('functionName')({ data });
```

## Functions

### submitTime

Submit a speedrun time for a map.

**Endpoint**: `submitTime`

**Parameters**:
```typescript
{
  mapId: string;    // Map identifier
  time: number;     // Time in milliseconds
}
```

**Returns**:
```typescript
{
  success: boolean;
  newBest: boolean;          // True if this is a new personal best
  time: number;              // The submitted time
  previousBest?: number;     // Previous best time (if newBest is true)
  currentBest?: number;      // Current best time (if newBest is false)
}
```

**Errors**:
- `unauthenticated`: User not logged in
- `invalid-argument`: Invalid mapId or time
- `not-found`: User profile not found
- `internal`: Server error

**Anti-Cheat**:
- Times under 1 second are rejected as suspicious
- Times over 1 hour are rejected
- All times are marked as `verified: true`

**Example**:
```javascript
const submitTime = firebase.functions().httpsCallable('submitTime');

try {
  const result = await submitTime({
    mapId: 'custom_level',
    time: 45230  // 45.23 seconds
  });

  if (result.data.newBest) {
    console.log('New personal best!', result.data.time);
  }
} catch (error) {
  console.error('Error submitting time:', error.message);
}
```

---

### awardCredits

Award credits to the current user.

**Endpoint**: `awardCredits`

**Parameters**:
```typescript
{
  amount: number;   // Credits to award (1-1000)
  reason: string;   // Reason for award (e.g., 'race_win', 'daily_bonus')
}
```

**Returns**:
```typescript
{
  success: boolean;
  newBalance: number;     // Updated credit balance
  awarded: number;        // Amount awarded
}
```

**Errors**:
- `unauthenticated`: User not logged in
- `invalid-argument`: Invalid amount (must be 1-1000, whole number)
- `internal`: Server error

**Transaction Logging**:
All credit awards are logged to `credit_transactions/{uid}` for auditing.

**Example**:
```javascript
const awardCredits = firebase.functions().httpsCallable('awardCredits');

const result = await awardCredits({
  amount: 100,
  reason: 'race_win'
});

console.log('New balance:', result.data.newBalance);
```

---

### transferCredits

Transfer credits between on-hand and secure (BASE) storage.

**Endpoint**: `transferCredits`

**Parameters**:
```typescript
{
  fromType: 'onhand' | 'secure';   // Source of credits
  toType: 'onhand' | 'secure';     // Destination
  amount: number;                   // Amount to transfer
}
```

**Returns**:
```typescript
{
  success: boolean;
  fromBalance: number;    // Updated source balance
  toBalance: number;      // Updated destination balance
}
```

**Errors**:
- `unauthenticated`: User not logged in
- `invalid-argument`: Invalid types or amount
- `failed-precondition`: Insufficient funds
- `internal`: Server error

**Example**:
```javascript
const transferCredits = firebase.functions().httpsCallable('transferCredits');

// Move 50 credits from on-hand to secure storage
const result = await transferCredits({
  fromType: 'onhand',
  toType: 'secure',
  amount: 50
});

console.log('On-hand balance:', result.data.fromBalance);
console.log('Secure balance:', result.data.toBalance);
```

---

### purchaseCosmetic

Purchase a cosmetic item.

**Endpoint**: `purchaseCosmetic`

**Parameters**:
```typescript
{
  cosmeticId: string;   // Cosmetic identifier
  price: number;        // Price in credits
}
```

**Returns**:
```typescript
{
  success: boolean;
  newBalance: number;   // Updated credit balance
}
```

**Errors**:
- `unauthenticated`: User not logged in
- `invalid-argument`: Invalid cosmeticId or price
- `already-exists`: Cosmetic already owned
- `failed-precondition`: Insufficient credits
- `internal`: Server error

**Example**:
```javascript
const purchaseCosmetic = firebase.functions().httpsCallable('purchaseCosmetic');

try {
  const result = await purchaseCosmetic({
    cosmeticId: 'skin_blue',
    price: 100
  });

  console.log('Purchased! New balance:', result.data.newBalance);
} catch (error) {
  if (error.code === 'already-exists') {
    console.log('You already own this cosmetic');
  } else if (error.code === 'failed-precondition') {
    console.log('Not enough credits');
  }
}
```

---

### saveLevel

Save a custom level to the database.

**Endpoint**: `saveLevel`

**Parameters**:
```typescript
{
  name: string;         // Level name (1-50 characters)
  levelData: {
    platforms: Array;   // Platform data
    hazards: Array;     // Hazard data
    // ... other level data
  }
}
```

**Returns**:
```typescript
{
  success: boolean;
  levelId: string;      // Generated level ID
}
```

**Errors**:
- `unauthenticated`: User not logged in
- `invalid-argument`: Invalid name or levelData
  - Name empty or over 50 chars
  - Missing platforms array
  - Over 1000 platforms
- `internal`: Server error

**Example**:
```javascript
const saveLevel = firebase.functions().httpsCallable('saveLevel');

const result = await saveLevel({
  name: 'My Awesome Level',
  levelData: {
    platforms: [
      { x: 0, y: 500, width: 200, height: 40 },
      // ... more platforms
    ],
    hazards: [],
    startX: 100,
    startY: 400,
    finishX: 1000,
    finishY: 400
  }
});

console.log('Level saved with ID:', result.data.levelId);
```

---

### getLeaderboard

Get leaderboard for a specific map.

**Endpoint**: `getLeaderboard`

**Parameters**:
```typescript
{
  mapId: string;            // Map identifier
  limit?: number;           // Max results (1-100, default 100)
  orderBy?: string;         // Order field (default 'time')
}
```

**Returns**:
```typescript
{
  mapId: string;
  count: number;
  leaderboard: Array<{
    rank: number;
    uid: string;
    username: string;
    time: number;
    timestamp: number;
    verified: boolean;
  }>
}
```

**Errors**:
- `invalid-argument`: Missing mapId
- `internal`: Server error

**Notes**:
- No authentication required (public data)
- Results are ordered by time (ascending)
- Limit is clamped between 1-100

**Example**:
```javascript
const getLeaderboard = firebase.functions().httpsCallable('getLeaderboard');

const result = await getLeaderboard({
  mapId: 'custom_level',
  limit: 10  // Top 10
});

result.data.leaderboard.forEach((entry, index) => {
  console.log(`${entry.rank}. ${entry.username} - ${entry.time}ms`);
});
```

---

## Rate Limiting

Currently, Cloud Functions do not have explicit rate limiting implemented. This is planned for a future version.

**Recommended client-side practices**:
- Debounce rapid function calls
- Cache leaderboard data
- Only submit times when level is completed
- Batch operations when possible

## Error Handling

All functions use Firebase's `HttpsError` with these error codes:

| Code | Description |
|------|-------------|
| `unauthenticated` | User not logged in |
| `invalid-argument` | Invalid input parameters |
| `failed-precondition` | Operation cannot be completed (e.g., insufficient funds) |
| `not-found` | Resource not found |
| `already-exists` | Resource already exists |
| `internal` | Server error |

**Example error handling**:
```javascript
try {
  const result = await someFunction(params);
} catch (error) {
  switch (error.code) {
    case 'unauthenticated':
      // Redirect to login
      break;
    case 'invalid-argument':
      console.error('Invalid input:', error.message);
      break;
    case 'failed-precondition':
      console.error('Cannot complete operation:', error.message);
      break;
    default:
      console.error('Unexpected error:', error);
  }
}
```

## Transaction Logging

All credit-related operations are logged to `credit_transactions/{uid}` with this structure:

```typescript
{
  type: 'award' | 'transfer' | 'purchase';
  amount: number;
  reason?: string;
  from?: string;
  to?: string;
  item?: string;
  timestamp: number;
  balance?: number;
}
```

This provides an audit trail for all economic activity.

## Security

- All functions validate input parameters
- Database write operations are server-side only
- Times are verified and marked
- Credit transactions are logged
- User ownership is enforced

---

For more information, see the [main README](../README.md) or check the [source code](../functions/index.js).
