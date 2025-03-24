import { createStateGraph } from 'ts-edge';
import { youtubeReportStore } from './state';
import { analysisNode } from './node/analysis';
import { standardOutputNode } from './node/standard-output';
import { youtubeInitializerNode } from './node/youtube-initializer';
import { youtubeThumbnailAnalysisNode } from './node/thumbnail-analysis';
import { youtubeCommentsAnalysisNode } from './node/comment-analysis';
import { youtubeTranscriptAnalysisNode } from './node/script-extraction';
import { youtubeSummarizationNode } from './node/summarization';
import { youtubeRelatedListNode } from './node/related';
import { youtubeContextualEnrichmentNode } from './node/contextual';
import { youtubeReportOutputNode } from './node/report-output';

const workflow = createStateGraph(youtubeReportStore)
  .addNode(analysisNode)
  .addNode(standardOutputNode)
  .addNode(youtubeInitializerNode)
  .addNode(youtubeThumbnailAnalysisNode)
  .addNode(youtubeTranscriptAnalysisNode)
  .addNode(youtubeCommentsAnalysisNode)
  .addNode(youtubeRelatedListNode)
  .addMergeNode(youtubeSummarizationNode)
  .addMergeNode(youtubeContextualEnrichmentNode)
  .addMergeNode(youtubeReportOutputNode)
  .dynamicEdge('analysis', {
    possibleTargets: ['output', 'youtube initializer'],
    router: ({ analysis }) => {
      return analysis?.type === 'youtube' ? 'youtube initializer' : 'output';
    },
  })
  .dynamicEdge('youtube initializer', {
    possibleTargets: ['related', 'comments', 'thumbnail', 'scripts', 'output'],
    router({ analysis }) {
      if (analysis?.type == 'standard') return 'output';

      return ['thumbnail', 'comments', 'scripts', 'related'];
    },
  });

// .dynamicEdge('start', {
//   possibleTargets: ['A', 'B'],
//   router: ({ nextStage }) => {
//     return nextStage === 'A' ? 'A' : 'B';
//   },
// })
// .edge('A', 'End')
// .edge('B', 'End');

export const createYoutubeReportAgent = () => workflow;
