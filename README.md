# ElaraV2 🎧

A mobile-first podcast assistant that lets users ask questions about podcast episodes and get responses in the actual voice of the hosts, powered by AI.

## Features

- 📱 **Mobile-First Design**: Built with Expo/React Native for cross-platform compatibility
- 🎙️ **Voice Synthesis**: Get responses in the actual voice of podcast hosts using ElevenLabs
- 🤖 **AI-Powered Q&A**: Advanced RAG (Retrieval-Augmented Generation) system with Claude and GPT-4
- 🎵 **Audio Playback**: Built-in podcast player with progress tracking
- 🗣️ **Voice Input**: Ask questions using voice or text input
- 🔍 **Semantic Search**: Find relevant podcast segments using OpenAI embeddings
- 📊 **Speaker Diarization**: Separate and identify different speakers in podcasts

## Tech Stack

### Frontend
- **Expo + React Native**: Cross-platform mobile development
- **expo-router**: File-based navigation
- **expo-av**: Audio playback and recording
- **TypeScript**: Type safety and better development experience

### Backend & APIs
- **Supabase**: Database and vector storage with pgvector
- **OpenAI**: Embeddings (text-embedding-3-small) and GPT-4o for responses
- **Claude**: Query rewriting and preprocessing
- **ElevenLabs**: Voice cloning and text-to-speech
- **WhisperX + Pyannote**: Transcription and speaker diarization (backend)

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (for iOS development) or Android Studio (for Android)

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd elara-v2
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   ```
   
   Fill in your API keys in `.env`:
   - Supabase URL and anon key
   - OpenAI API key
   - Claude API key
   - ElevenLabs API key

3. **Start Development**:
   ```bash
   npm start
   ```

### Running the App

- **iOS**: `npm run ios` or scan QR code with Expo Go
- **Android**: `npm run android` or scan QR code with Expo Go
- **Web**: `npm run web` (limited functionality)

## Project Structure

```
elara-v2/
├── app/                    # Expo Router pages
│   ├── _layout.tsx         # Root layout with navigation
│   ├── index.tsx           # Landing page (podcast link input)
│   └── [episode]/
│       └── index.tsx       # Episode page (player + chat)
├── components/             # Reusable UI components
│   ├── PodcastPlayer.tsx   # Audio player with controls
│   ├── ChatInput.tsx       # Voice/text input component
│   └── ResponseAudio.tsx   # AI response playback
├── lib/                    # Core functionality
│   ├── api.ts              # API integrations
│   └── embeddings.ts       # Vector search helpers
├── constants/
│   └── prompts.ts          # Host personality prompts
└── .env                    # Environment variables
```

## API Integration

### Supabase Schema

The app expects these tables in Supabase:

```sql
-- Episodes table
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_url TEXT NOT NULL,
  title TEXT,
  audio_url TEXT,
  hosts TEXT[],
  transcript TEXT,
  processing_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Segments table for vector search
CREATE TABLE segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID REFERENCES episodes(id),
  content TEXT NOT NULL,
  speaker TEXT,
  timestamp_start FLOAT,
  timestamp_end FLOAT,
  embedding VECTOR(1536), -- OpenAI embeddings dimension
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable vector similarity search
CREATE OR REPLACE FUNCTION search_segments(
  episode_id UUID,
  query_embedding VECTOR(1536),
  similarity_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  speaker TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.content,
    s.speaker,
    1 - (s.embedding <=> query_embedding) AS similarity
  FROM segments s
  WHERE s.episode_id = search_segments.episode_id
    AND 1 - (s.embedding <=> query_embedding) > similarity_threshold
  ORDER BY s.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### Host Voice Configuration

Update `constants/prompts.ts` with your ElevenLabs voice IDs:

```typescript
export const HOST_PROMPTS = {
  chamath: {
    voiceId: 'your-actual-chamath-voice-id',
    // ... other config
  },
  // ... other hosts
};
```

## Testing with Expo

You can test the app in several ways:

### 1. Expo Go App (Recommended for quick testing)
- Install Expo Go from App Store/Play Store
- Run `npm start` in your project
- Scan the QR code with your phone

### 2. iOS Simulator
- Install Xcode and iOS Simulator
- Run `npm run ios`

### 3. Android Emulator
- Install Android Studio and create an AVD
- Run `npm run android`

### 4. Web Browser (Limited functionality)
- Run `npm run web`
- Note: Audio recording may not work in browser

## Development Workflow

1. **Add a new feature**: Create components in `components/` directory
2. **Add new screens**: Create files in `app/` directory (uses file-based routing)
3. **API changes**: Update `lib/api.ts`
4. **Styling**: Use StyleSheet.create() or consider adding NativeWind for Tailwind-like styling

## Deployment

### Expo Application Services (EAS)
```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

### Native Conversion
When ready for production, you can eject to native code:
```bash
npx expo eject
```

## Roadmap

- [ ] **MVP Features**
  - [x] Basic podcast link processing
  - [x] Audio playback
  - [x] Voice/text input
  - [x] AI-powered responses
  - [ ] ElevenLabs voice synthesis integration
  - [ ] Backend podcast processing pipeline

- [ ] **Enhanced Features**
  - [ ] Multi-host selection
  - [ ] Full transcript display
  - [ ] Conversation history
  - [ ] Offline mode
  - [ ] Push notifications for processing completion

- [ ] **Production Ready**
  - [ ] Error handling and retry logic
  - [ ] Performance optimization
  - [ ] Comprehensive testing
  - [ ] Analytics integration
  - [ ] Native iOS/Swift port

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ using Expo and modern AI technologies. 