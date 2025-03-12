// // import React, { useCallback } from 'react';
// // import { ReactFlow, ReactFlowProvider, useNodesState, useEdgesState, useReactFlow } from '@xyflow/react';

// import '@xyflow/react/dist/style.css';

// // export const initialNodes = [
// //   {
// //     id: '1',
// //     type: 'input',
// //     data: { label: 'input' },
// //     position: { x: 0, y: 0 },
// //   },
// //   {
// //     id: '2',
// //     data: { label: 'node 2' },
// //     position: { x: 0, y: 100 },
// //   },
// //   {
// //     id: '2a',
// //     data: { label: 'node 2a' },
// //     position: { x: 0, y: 200 },
// //   },
// //   {
// //     id: '2b',
// //     data: { label: 'node 2b' },
// //     position: { x: 0, y: 300 },
// //   },
// //   {
// //     id: '2c',
// //     data: { label: 'node 2c' },
// //     position: { x: 0, y: 400 },
// //   },
// //   {
// //     id: '2d',
// //     data: { label: 'node 2d' },
// //     position: { x: 0, y: 500 },
// //   },
// //   {
// //     id: '3',
// //     data: { label: 'node 3' },
// //     position: { x: 200, y: 100 },
// //   },
// // ];

// // export const initialEdges = [
// //   { id: 'e12', source: '1', target: '2', animated: true },
// //   { id: 'e13', source: '1', target: '3', animated: true },
// //   { id: 'e22a', source: '2', target: '2a', animated: true },
// //   { id: 'e22b', source: '2', target: '2b', animated: true },
// //   { id: 'e22c', source: '2', target: '2c', animated: true },
// //   { id: 'e2c2d', source: '2c', target: '2d', animated: true },
// // ];
// // const getLayoutedElements = (nodes, edges) => {
// //   return { nodes, edges };
// // };

// // const LayoutFlow = () => {
// //   const { fitView } = useReactFlow();
// //   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
// //   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

// //   const onLayout = useCallback(() => {
// //     const layouted = getLayoutedElements(nodes, edges);

// //     setNodes([...layouted.nodes]);
// //     setEdges([...layouted.edges]);

// //     window.requestAnimationFrame(() => {
// //       fitView();
// //     });
// //   }, [nodes, edges]);

// //   return <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView />;
// // };

// // export default function () {
// //   return (
// //     <ReactFlowProvider>
// //       <LayoutFlow />
// //     </ReactFlowProvider>
// //   );
// // }

// import { useEffect } from 'react';
// import { ReactFlow, useNodesState, useEdgesState } from '@xyflow/react';
// import getWorkflowLayout, { startNodeName, testWorkflowData } from './example';

// // 워크플로우 컴포넌트
// export default function WorkflowChart() {
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);

//   useEffect(() => {
//     // dagre를 사용한 레이아웃 계산
//     const { nodes: layoutedNodes, edges: layoutedEdges } = getWorkflowLayout(testWorkflowData, startNodeName, 'TB');

//     setNodes(layoutedNodes);
//     setEdges(layoutedEdges);
//   }, []);

//   return (
//     <div className="w-full h-full">
//       <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView />
//     </div>
//   );
// }
