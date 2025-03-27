/**
 * 오디오 시각화를 위한 유틸리티 함수들
 */

export interface VisualizerOptions {
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
}

export interface AudioVisualizerData {
  frequencyData: Uint8Array;
  timeData: Uint8Array;
  volume: number;
}

/**
 * 오디오 시각화를 위한 AudioContext 및 분석기를 설정합니다.
 * @param stream 분석할 오디오 스트림
 * @param options 시각화 옵션
 * @returns 오디오 분석을 위한 객체들
 */
export const setupAudioVisualizer = (
  stream: MediaStream,
  options: VisualizerOptions = {}
): {
  audioContext: AudioContext;
  analyser: AnalyserNode;
  source: MediaStreamAudioSourceNode;
} => {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);

  // 분석기 옵션 설정
  analyser.fftSize = options.fftSize || 2048;
  analyser.smoothingTimeConstant = options.smoothingTimeConstant || 0.8;

  if (options.minDecibels) {
    analyser.minDecibels = options.minDecibels;
  }

  if (options.maxDecibels) {
    analyser.maxDecibels = options.maxDecibels;
  }

  source.connect(analyser);

  return { audioContext, analyser, source };
};

/**
 * 오디오 분석기에서 시각화 데이터를 가져옵니다.
 * @param analyser 오디오 분석기
 * @returns 시각화 데이터 (주파수, 시간 도메인, 볼륨)
 */
export const getVisualizationData = (analyser: AnalyserNode): AudioVisualizerData => {
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  const timeData = new Uint8Array(analyser.frequencyBinCount);

  analyser.getByteFrequencyData(frequencyData);
  analyser.getByteTimeDomainData(timeData);

  // 현재 볼륨(음량) 계산
  const volume = calculateVolume(frequencyData);

  return { frequencyData, timeData, volume };
};

/**
 * 주파수 데이터에서 볼륨(음량)을 계산합니다.
 * @param frequencyData 주파수 데이터 배열
 * @returns 0-100 사이의 볼륨 값
 */
export const calculateVolume = (frequencyData: Uint8Array): number => {
  let sum = 0;

  // 모든 주파수 값의 평균을 구함
  for (let i = 0; i < frequencyData.length; i++) {
    sum += frequencyData[i];
  }

  // 0-255 범위에서 0-100 범위로 정규화
  const average = sum / frequencyData.length;
  const volume = Math.round((average / 255) * 100);

  return volume;
};

/**
 * 시각화를 위한 애니메이션 프레임 요청
 * @param callback 각 프레임에서 호출할 콜백 함수
 * @returns 애니메이션 ID (애니메이션 중지에 사용)
 */
export const startVisualizationLoop = (callback: () => void): number => {
  const animate = () => {
    callback();
    return requestAnimationFrame(animate);
  };

  return animate();
};

/**
 * 애니메이션 루프를 중지합니다.
 * @param animationId 중지할 애니메이션 ID
 */
export const stopVisualizationLoop = (animationId: number): void => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
};

/**
 * AudioContext를 정리합니다.
 * @param audioContext 정리할 AudioContext
 */
export const cleanupAudioContext = async (audioContext: AudioContext): Promise<void> => {
  if (audioContext && audioContext.state !== 'closed') {
    await audioContext.close();
  }
};
