import AudioChat from '../../components/AudioChat';
import type { NextPage } from 'next';

const SpeechRecognitionPage: NextPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-8 text-center">음성 인식 테스트</h1>
        <AudioChat />
      </div>
    </main>
  );
};

export default SpeechRecognitionPage;
