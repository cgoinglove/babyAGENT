import AudioChat from '@/components/AudioChat';

const Home: React.FC = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">Baby Friday</h1>

      <div className="w-full max-w-md mx-auto">
        <div className="border p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6 text-center">음성 비서</h2>
          <AudioChat />
        </div>
      </div>
    </main>
  );
};

export default Home;
