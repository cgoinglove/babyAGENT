import { agents } from './api/workflow/agents';
import LeftSide from './components/left-side';
import RightSide from './components/right-side';

export default function WorkFlow() {
  const items = agents.map((agent) => ({
    name: agent.name,
    description: agent.description,
    defaultPrompt: agent.defaultPrompt,
    structure: agent.api.getNodeStructures(),
  }));

  return (
    <div className="flex h-screen w-full">
      <div className="w-full md:w-1/2 border-r border-sub-text">
        <LeftSide agents={items} />
      </div>
      <div className="w-1/2">
        <RightSide />
      </div>
    </div>
  );
}
