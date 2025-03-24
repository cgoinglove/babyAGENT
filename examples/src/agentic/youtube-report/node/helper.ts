const RE_YOUTUBE = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;

export const extractYoutubeVideoId = (url: string) => {
  const isYoutubeUrl = url.includes('youtube.com') || url.includes('youtu.be');

  if (!isYoutubeUrl) {
    throw new Error('Invalid Youtube URL');
  }
  const matchId = url.match(RE_YOUTUBE);
  if (matchId && matchId.length) {
    return matchId[1];
  }
  throw new Error('Invalid Youtube URL');
};
