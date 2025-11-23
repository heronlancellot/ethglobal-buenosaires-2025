## Create a Mini App

[Mini apps](https://docs.worldcoin.org/mini-apps) enable third-party developers to create native-like applications within World App.

This template is a way for you to quickly get started with authentication and examples of some of the trickier commands.

## Getting Started

1. cp .env.example .env.local
2. Follow the instructions in the .env.local file
3. Run `npm run dev`
4. Run `ngrok http 3000`
5. Run `npx auth secret` to update the `AUTH_SECRET` in the .env.local file
6. Add your domain to the `allowedDevOrigins` in the next.config.ts file.
7. [For Testing] If you're using a proxy like ngrok, you need to update the `AUTH_URL` in the .env.local file to your ngrok url.
8. Continue to developer.worldcoin.org and make sure your app is connected to the right ngrok url
9. [Optional] For Verify and Send Transaction to work you need to do some more setup in the dev portal. The steps are outlined in the respective component files.

## Authentication

This starter kit uses [Minikit's](https://github.com/worldcoin/minikit-js) wallet auth to authenticate users, and [next-auth](https://authjs.dev/getting-started) to manage sessions.

## UI Library

This starter kit uses [Mini Apps UI Kit](https://github.com/worldcoin/mini-apps-ui-kit) to style the app. We recommend using the UI kit to make sure you are compliant with [World App's design system](https://docs.world.org/mini-apps/design/app-guidelines).

## Eruda

[Eruda](https://github.com/liriliri/eruda) is a tool that allows you to inspect the console while building as a mini app. You should disable this in production.

## Contributing

This template was made with help from the amazing [supercorp-ai](https://github.com/supercorp-ai) team.

# Nomad Experience Smart Contracts

This repository contains the smart contracts for the Nomad Experience platform, a decentralized system for creating and managing travel experiences.

## 📋 Contracts

### 1. Nomad Experience (`0x7897ba174a1B428a1Cf214b65927Bb51ED654CC6`)

Main contract for managing travel experiences.

#### Core Features

**Experience Creation and Management**
- `createExperience()` - Creates a new experience
- `updateExperience()` - Updates experience details
- `cancelExperience()` - Cancels an experience
- `getExperience()` - Gets complete experience details

**Participation System**
- `requestJoin()` - Requests to join an experience (payment required)
- `approveJoin()` - Approves participation request
- `rejectJoin()` - Rejects participation request
- `getJoinRequests()` - Lists pending requests
- `getParticipants()` - Lists approved participants

**Rating and Reputation**
- `rateExperience()` - Rates an experience (1-5 stars)
- `getUserApprovedExperiences()` - User's approved experiences
- `getUserRequestedExperiences()` - User's requested experiences

#### Experience Structure
Each experience contains:
- Title, description, and cover image
- Location and dates (start/end)
- Price and maximum participants
- Status (active/canceled)
- Participant count and average rating

### 2. Noma Profile Hub (`0x23904296D38a8dD4F3C584B4206618130909a0b4`)

Contract for managing user profiles and reputation.

#### Profile Features

**User Statistics**
- `hostedCount` - Number of experiences hosted
- `attendedCount` - Number of experiences attended
- `lastHostedTimestamp` - Last hosting time
- `lastJoinedTimestamp` - Last participation time

**Reputation Updates**
- `incrementHosted()` - Increments hosting counter
- `incrementAttended()` - Increments attendance counter
- `getProfile()` - Gets user's complete profile

## 🔗 Contract Integration

The contracts work together:
- Nomad Experience references Profile Hub in constructor
- Actions in Experience automatically update statistics in Profile Hub
- Cross-reputation system between hosting and participation

## 📊 Emitted Events

### Nomad Experience
- `ExperienceCreated` - New experience created
- `JoinRequested` - Participation request
- `JoinApproved`/`JoinRejected` - Approval/Rejection
- `ExperienceRated` - Rating recorded
- `Canceled` - Experience canceled
- `Updated` - Experience updated

### Profile Hub
- `ProfileCreated` - New profile created
- `HostedIncremented`/`AttendedIncremented` - Statistics updated
- `ExperienceCancelled` - Experience canceled

## 🛠 Basic Usage

### Create an Experience
```javascript
await nomadExperience.createExperience(
  "Title",
  "Description",
  "image.jpg",
  startTimestamp,
  endTimestamp,
  "Location",
  price,
  maxParticipants
);
```

### Request to Join
```javascript
await nomadExperience.requestJoin(experienceId, { value: price });
```

### Rate Experience
```javascript
await nomadExperience.rateExperience(experienceId, 5); // 1-5 stars
```

## 🔒 Security

- Access controls for creation and approval
- Payment validation in `requestJoin()`
- Duplicate participation prevention
- Time checks for experiences

## 🌟 Key Features

- **Reputation System**: Track record of hosting and participation
- **Manual Approval**: Control over participants
- **Rating System**: Quality rating mechanism
- **Flexibility**: Experience details can be updated
- **Transparency**: All data is public on blockchain

This system provides a robust foundation for decentralized travel experience marketplaces, with focus on trust and reputation between users.
