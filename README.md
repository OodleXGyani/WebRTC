# WebRTC Calling App

A full-featured **React Native** mobile application for peer-to-peer video and audio calling using WebRTC. This app enables direct video/audio communication between users without intermediaries after the initial connection setup.

## 📱 Features

- **Peer-to-Peer Video/Audio Calls** - Direct connection between users using WebRTC
- **User ID-based Calling** - Simple ID-based system to call other users
- **Manual Mode (Developer)** - Debug mode for manual SDP offer/answer exchange
- **Incoming Call Handling** - Accept or reject incoming calls with a beautiful UI
- **Call Controls** - Toggle microphone and camera on/off during calls
- **Dark/Light Theme** - Beautiful theming with dark and light mode support
- **Connection Status** - Real-time signaling server connection status
- **Clipboard Support** - Copy user IDs and SDP data with one tap


## 🚀 How to Use

### Prerequisites

- **Node.js** >= 20
- **React Native** development environment set up
- **Android Studio** (for Android) or **Xcode** (for iOS)
- Physical device (camera/microphone not available on emulator)

### Installation

1. **Clone and install dependencies:**

```bash
cd WebRTC
npm install
```

2. **Start Metro:**

```bash
npm start
# OR
npx react-native start
```

3. **Run on Android:**

```bash
npm run android
# OR
npx react-native run-android
```


### Quick Start Guide

#### Mode 1: Automatic User ID Calling (Recommended)

1. **User A** opens the app
   - Waits for connection status to show "Connected"
   - Copies their User ID

2. **User A shares ID** with User B (via chat, email, etc.)

3. **User B** opens the app
   - Pastes User A's ID in "User ID to call"
   - Taps "Start Call"

4. **User A** sees incoming call screen
   - Taps "Accept" to start the call

5. **Both users** can now video chat!
   - Toggle microphone/camera using the control buttons
   - End call anytime with the red "End" button

#### Mode 2: Manual SDP Exchange (Developer Mode)

For testing without a signaling server or debugging:

**Caller (Create Offer):**
1. Navigate to "Manual Mode" → "Create Call (Manual)"
2. Tap "Generate Offer"
3. Copy the generated SDP offer
4. Share it with the callee (via text, email, etc.)
5. Wait for answer, then paste and apply

**Callee (Join Call):**
1. Navigate to "Manual Mode" → "Join Call (Manual)"
2. Paste the offer from caller
3. Tap "Create Answer"
4. Copy the answer and share with caller
5. ICE candidates will be exchanged automatically



------------------------------ For Developers Only -----------------------------


## 🏗️ Project Architecture

```
WebRTC Calling App
├── App.tsx                    # Main app entry point with providers
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Button.tsx         # Custom button component
│   │   ├── Card.tsx           # Card container component
│   │   ├── Icon.tsx           # Icon component
│   │   ├── InputField.tsx     # Text input with label
│   │   ├── Section.tsx        # Section container with title
│   │   ├── ThemeToggle.tsx    # Dark/light mode toggle
│   │   └── ToggleButton.tsx   # On/off toggle button
│   ├── contexts/              # React Context providers
│   │   ├── CallContext.tsx    # Central call state management
│   │   └── ThemeContext.tsx   # Theme state management
│   ├── navigation/            # Navigation setup
│   │   └── AppNavigator.tsx   # Stack navigator with screens
│   ├── screens/               # App screens
│   │   ├── HomeScreen.tsx     # Main screen with user ID & call UI
│   │   ├── CreateOfferScreen.tsx  # Manual mode: create offer
│   │   ├── JoinCallScreen.tsx     # Manual mode: join call
│   │   └── IncomingCallScreen.tsx # Incoming call UI
│   ├── signaling/             # WebSocket signaling layer
│   │   ├── socket.ts          # WebSocket transport
│   │   ├── types.ts           # Message type definitions
│   │   └── useSignaling.ts    # Signaling hook
│   ├── webrtc/                # WebRTC layer
│   │   ├── media.ts           # Media stream utilities
│   │   ├── useWebRTC.ts       # WebRTC hook
│   │   └── useCallIntegration.ts  # Call orchestration
│   ├── constants/             # Configuration & constants
│   │   ├── config.ts          # App configuration
│   │   ├── ice.ts             # ICE server configuration
│   │   └── theme.ts           # Theme colors & styles
│   └── utils/                 # Utility functions
│       ├── clipboard.ts       # Clipboard utilities
│       ├── permissions.ts     # Permission helpers
│       └── userId.ts          # User ID generation
├── android/                   # Android native code
├── ios/                       # iOS native code
└── package.json               # Dependencies
```

## 🔄 Project Flow

### 1. **Initialization Flow**

```
App.tsx
    ↓
CallProvider (CallContext.tsx)
    ├── useCallIntegration.ts
    │   ├── useSignaling() → Connects to signaling server
    │   └── useWebRTC() → Initializes WebRTC peer connection
    └── useCall() hook provides state to all screens
```

### 2. **Call Flow (User ID Mode)**

```
┌──────────────┐                           ┌─────────────────┐
│   User A     │                           │   Signaling     │
│  (Caller)    │                           │    Server       │
└──────┬───────┘                           └────────┬────────┘
       │                                          │
       │  1. Connect & Register                   │
       │ ────────────────────────────────────────>
       │                                          │
       │  2. Get User ID (e.g., "user-abc123")   │
       │ <───────────────────────────────────────
       │                                          │
       │  3. Share ID with User B                 │
       │     (outside app)                        │
       │                                          │
       │  4. Enter User B's ID & tap "Start Call" │
       │ ────────────────────────────────────────>
       │         (type: "call", to: "user-xyz")
       │                                          │
       │                                          │  5. Notify User B
       │                                          <───────────────
       │                                          │
       │                                          │  6. User B accepts
       │                                          <───────────────
       │  7. WebRTC ICE negotiation              ───────────────>
       │     (offer/answer/ice candidates)       (via signaling)
       │  8. Direct P2P Connection Established   <───────────────
       │                                          │
       │  9. Video/Audio Streams Flow Directly   <───────────────
       │     (No server involvement)             
```

### 3. **Manual Mode Flow (SDP Exchange)**

For testing/debugging without automatic signaling:

```
┌──────────────┐                    ┌──────────────┐
│   Caller     │                    │   Callee     │
└──────┬───────┘                    └──────┬───────┘
       │                                  │
       │  1. Generate Offer (SDP)         │
       │ <────────────────────────────────
       │                                  │
       │  2. Copy & Share Offer (manual)  │
       │ ────────────────────────────────>
       │                                  │
       │                                  │  3. Paste Offer
       │                                  │  4. Generate Answer
       │ <────────────────────────────────
       │                                  │
       │  5. Copy & Share Answer          │
       │ ────────────────────────────────>
       │                                  │
       │  6. Paste Answer                 │
       │  7. ICE Candidates Exchange      │
       │ <────────────────────────────────
       │                                  │
       │  8. P2P Connection Established   │
```

### 4. **Component Data Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                    CallContext (State)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Signaling State:                                    │   │
│  │ • userId, isSignalingConnected                      │   │
│  │ • incomingCallFrom, activeCallWith                  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ WebRTC State:                                       │   │
│  │ • localStream, remoteStream, iceCandidates          │   │
│  │ • isMicOn, isCamOn, initError                      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Actions:                                            │   │
│  │ • callUser, acceptCall, rejectCall, endCall         │   │
│  │ • createOffer, createAnswer, applyAnswer            │   │
│  │ • toggleMic, toggleCamera                           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ useCall() hook
                           ▼
┌────────────┐  ┌──────────────┐  ┌──────────────────┐
│HomeScreen  │  │CreateOffer   │  │IncomingCallScreen│
│(Main UI)   │  │(Manual Mode) │  │(Call Handling)   │
└────────────┘  └──────────────┘  └──────────────────┘
```

### 5. **Signaling Message Types**

```
Register → User registers with server
   │
   ├── Call → Initiate call to user
   │     │
   │     ├── Offer → SDP offer from caller
   │     │     │
   │     │     └── Answer → SDP answer from callee
   │     │
   │     └── Ice → ICE candidate exchange
   │
   └── End → Call termination
```
