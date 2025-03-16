export default function JsonView({ data }: { data: any }) {
  return (
    <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm whitespace-pre-wrap break-all max-h-96">
      {JSON.stringify(data, null, 2).replaceAll('\\n', '\n').replaceAll('\\"', '"')}
    </pre>
  );
}
