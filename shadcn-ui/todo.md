# Social Network Graph Analyzer - MVP Todo

## Project Overview
A full-stack social network analyzer with graph visualization and algorithms.

## MVP Features (Simplified for 8 file limit)
1. **Frontend Components (React + D3.js)**:
   - Main dashboard with graph visualization
   - User management (add/remove users and friendships)
   - Path finder tool (BFS shortest path)
   - Basic community detection display

2. **Backend Simulation (No real backend - localStorage)**:
   - Graph data structure in frontend
   - BFS, DFS, Union-Find algorithms in frontend utils
   - LocalStorage for data persistence

## Files to Create/Modify (8 files max):

### Frontend Files:
1. **src/pages/Index.tsx** - Main dashboard with graph visualization
2. **src/components/GraphVisualization.tsx** - D3.js graph component
3. **src/components/UserManagement.tsx** - Add/remove users and friendships
4. **src/components/PathFinder.tsx** - Find shortest path between users
5. **src/utils/graphAlgorithms.ts** - BFS, DFS, Union-Find implementations
6. **src/utils/graphData.ts** - Data management and localStorage
7. **src/types/graph.ts** - TypeScript interfaces
8. **index.html** - Update title and meta

## Simplified Architecture:
- **Frontend-only MVP** with localStorage persistence
- Graph algorithms implemented in TypeScript
- D3.js for interactive visualization
- Real-time updates within the single-page app
- Clean TailwindCSS styling

## Key Algorithms:
- **BFS**: Shortest path between two users
- **DFS**: Connected components (communities)
- **Union-Find**: Efficient community detection
- **Mutual Friends**: Friend suggestions

This MVP focuses on core functionality and can be extended to full-stack later.