import { agents } from '../../agents';

export async function POST(req: Request, { params }: { params: Promise<{ agent: string; action: string }> }) {
  const { action, agent } = await params;

  const api = agents.find((a) => agent === a.name)?.api;

  if (!api) {
    return Response.json({ error: 'Agent not found' }, { status: 404 });
  }

  if (action == 'reset') {
    api.reset();
    return Response.json({ message: 'Reset' });
  }

  if (action == 'start') {
    const { prompt } = await req.json();

    const stream = api.start({
      text: prompt,
    });

    return new Response(stream);
  }

  if (action == 'stop') {
    api.stop();
    return Response.json({ message: 'Stop' });
  }

  if (action == 'resume') {
    api.resume();
    return Response.json({ message: 'Resume' });
  }

  return Response.json({ error: 'not found' }, { status: 404 });
}
