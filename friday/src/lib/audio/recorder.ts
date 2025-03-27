/**
 * 오디오 녹음을 위한 유틸리티 함수들
 */

export type RecorderState = 'inactive' | 'recording' | 'paused';

export interface AudioRecorderResult {
  audioBlob: Blob;
  audioUrl: string;
  mimeType: string;
}

export interface RecorderHookReturn {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<AudioRecorderResult>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  mediaRecorder: MediaRecorder | null;
  audioStream: MediaStream | null;
  recordingState: RecorderState;
}

/**
 * 브라우저의 오디오 녹음 기능을 시작합니다.
 * @returns Promise<MediaStream> 오디오 스트림
 */
export const startAudioStream = async (): Promise<MediaStream> => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('브라우저가 오디오 녹음 기능을 지원하지 않습니다.');
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    return stream;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('마이크 접근 권한이 거부되었습니다.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('마이크를 찾을 수 없습니다.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        throw new Error('마이크를 사용할 수 없습니다.');
      } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
        throw new Error('오디오 제약 조건을 만족할 수 없습니다.');
      }
    }
    throw new Error('오디오 녹음을 시작하는 동안 오류가 발생했습니다.');
  }
};

/**
 * MediaStream을 종료합니다.
 * @param stream 종료할 MediaStream
 */
export const stopAudioStream = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
};

/**
 * 오디오 데이터를 저장하기 위한 최적의 MIME 타입을 결정합니다.
 * @returns 지원되는 오디오 MIME 타입
 */
export const getSupportedAudioMimeType = (): string => {
  const types = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/mpeg'];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return 'audio/webm'; // 기본값
};

/**
 * Blob을 Data URL로 변환합니다.
 * @param blob 변환할 Blob 객체
 * @returns Promise<string> Data URL
 */
export const createAudioUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};

/**
 * Data URL을 해제합니다.
 * @param url 해제할 Data URL
 */
export const revokeAudioUrl = (url: string): void => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};
