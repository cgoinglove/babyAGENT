export const calculateRanker = (
  sourceToTargets: Record<string, string[]>
): Record<string, { level: number; index: number }> => {
  // 1. 타겟에서 소스로의 매핑 생성
  const targetToSources: Record<string, string[]> = {};
  const allNodes = new Set<string>();

  for (const [source, targets] of Object.entries(sourceToTargets)) {
    allNodes.add(source);
    for (const target of targets) {
      allNodes.add(target);
      if (!targetToSources[target]) targetToSources[target] = [];
      targetToSources[target].push(source);
    }
  }

  // 2. 시작 노드 식별
  const startNodes: string[] = [];
  allNodes.forEach((node) => {
    if (!targetToSources[node] || targetToSources[node].length === 0) {
      startNodes.push(node);
    }
  });

  // 3. 부모 노드 기반으로 노드 그룹화 (순환 고려)
  const nodeGroups: string[][] = [];
  const visited = new Set<string>();
  const currentPath = new Set<string>(); // 현재 경로 추적

  // 시작 노드를 첫 번째 그룹으로
  if (startNodes.length > 0) {
    nodeGroups.push([...startNodes]);
    startNodes.forEach((node) => visited.add(node));
  }

  // BFS로 레벨별 노드 그룹화
  while (visited.size < allNodes.size) {
    const currentGroup: string[] = [];
    const nextLevel = new Set<string>();

    // 현재까지 방문한 모든 노드에서 나가는 엣지 확인
    for (const node of visited) {
      const targets = sourceToTargets[node] || [];

      for (const target of targets) {
        // 이미 방문했거나 경로 사이클에 있는 노드는 건너뜀
        if (visited.has(target) || currentPath.has(target)) continue;

        nextLevel.add(target);
        currentPath.add(target);
      }
    }

    // 다음 레벨에 노드가 없으면 방문하지 않은 임의의 노드 추가 (고립된 사이클 처리)
    if (nextLevel.size === 0) {
      for (const node of allNodes) {
        if (!visited.has(node)) {
          nextLevel.add(node);
          break;
        }
      }
    }

    // 다음 레벨 노드들을 현재 그룹에 추가
    for (const node of nextLevel) {
      currentGroup.push(node);
      visited.add(node);
    }

    // 현재 그룹이 비어있지 않으면 추가
    if (currentGroup.length > 0) {
      nodeGroups.push(currentGroup);
    }

    // 현재 경로 초기화
    currentPath.clear();
  }

  // 4. 그룹 기반으로 레벨 할당
  const levels: Record<string, number> = {};
  nodeGroups.forEach((group, level) => {
    group.forEach((node) => {
      levels[node] = level;
    });
  });

  // 5. 같은 레벨 내에서 인덱스 계산
  // 먼저 같은 레벨 내 의존성 파악
  const sameLevelDependencies: Record<string, Set<string>> = {};

  for (const [source, targets] of Object.entries(sourceToTargets)) {
    for (const target of targets) {
      if (levels[source] === levels[target]) {
        if (!sameLevelDependencies[target]) {
          sameLevelDependencies[target] = new Set();
        }
        sameLevelDependencies[target].add(source);
      }
    }
  }

  // 같은 레벨 내 위상 정렬
  const result: Record<string, { level: number; index: number; name: string }> = {};
  const nodesByLevel: Record<number, string[]> = {};

  // 레벨별로 노드 그룹화
  for (const [node, level] of Object.entries(levels)) {
    if (!nodesByLevel[level]) {
      nodesByLevel[level] = [];
    }
    nodesByLevel[level].push(node);
  }

  // 각 레벨 내에서 위상 정렬
  for (const [levelStr, nodes] of Object.entries(nodesByLevel)) {
    const level = parseInt(levelStr);
    const indices: Record<string, number> = {};
    let currentIndex = 0;

    // 의존성이 없는 노드 먼저 처리
    const nodesWithNoDependencies = nodes.filter(
      (node) => !sameLevelDependencies[node] || sameLevelDependencies[node].size === 0
    );

    nodesWithNoDependencies.forEach((node) => {
      indices[node] = currentIndex++;
    });

    // 나머지 노드 처리
    let remainingNodes = nodes.filter((node) => !Object.hasOwn(indices, node));
    while (remainingNodes.length > 0) {
      let processed = false;

      for (const node of [...remainingNodes]) {
        // 이 노드의 모든 의존성이 처리되었는지 확인
        const dependencies = sameLevelDependencies[node] || new Set();
        const allDependenciesProcessed = Array.from(dependencies).every((dep) => Object.hasOwn(indices, dep));

        if (allDependenciesProcessed) {
          indices[node] = currentIndex++;
          remainingNodes = remainingNodes.filter((n) => n !== node);
          processed = true;
        }
      }

      // 교착 상태(사이클)이 감지되면 임의로 노드 하나 처리
      if (!processed && remainingNodes.length > 0) {
        indices[remainingNodes[0]] = currentIndex++;
        remainingNodes.shift();
      }
    }

    nodes.forEach((node) => {
      result[node] = { level, index: indices[node], name: node };
    });
  }

  return result;
};
