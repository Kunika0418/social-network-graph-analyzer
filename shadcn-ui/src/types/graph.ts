export interface User {
  id: string;
  name: string;
  x?: number;
  y?: number;
}

export interface Friendship {
  source: string;
  target: string;
}

export interface GraphData {
  users: User[];
  friendships: Friendship[];
}

export interface PathResult {
  path: string[];
  distance: number;
}

export interface Community {
  id: number;
  users: string[];
  color: string;
}

export interface GraphStats {
  totalUsers: number;
  totalFriendships: number;
  totalCommunities: number;
}

export interface D3Node extends User {
  x: number;
  y: number;
  fx?: number;
  fy?: number;
}

export interface D3Link {
  source: string | D3Node;
  target: string | D3Node;
}