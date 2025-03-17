import { agents } from './agents';

export async function GET() {
  const agent = agents.map((agent) => ({
    name: agent.name,
    description: agent.description,
    defaultPrompt: agent.defaultPrompt,
    structure: agent.api.getNodeStructures(),
  }));
  return Response.json(agent);
}
