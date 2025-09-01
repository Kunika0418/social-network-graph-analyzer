import { User, Friendship, PathResult, Community } from '@/types/graph';

export class GraphAlgorithms {
  private users: User[];
  private friendships: Friendship[];
  private adjacencyList: Map<string, Set<string>>;

  constructor(users: User[], friendships: Friendship[]) {
    this.users = users;
    this.friendships = friendships;
    this.adjacencyList = this.buildAdjacencyList();
  }

  private buildAdjacencyList(): Map<string, Set<string>> {
    const adj = new Map<string, Set<string>>();
    
    // Initialize adjacency list
    this.users.forEach(user => {
      adj.set(user.id, new Set());
    });

    // Add edges (bidirectional)
    this.friendships.forEach(friendship => {
      adj.get(friendship.source)?.add(friendship.target);
      adj.get(friendship.target)?.add(friendship.source);
    });

    return adj;
  }

  // BFS - Find shortest path between two users
  findShortestPath(startId: string, endId: string): PathResult | null {
    if (startId === endId) {
      return { path: [startId], distance: 0 };
    }

    const queue: string[] = [startId];
    const visited = new Set<string>([startId]);
    const parent = new Map<string, string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = this.adjacencyList.get(current) || new Set();

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent.set(neighbor, current);
          queue.push(neighbor);

          if (neighbor === endId) {
            // Reconstruct path
            const path: string[] = [];
            let node = endId;
            while (node) {
              path.unshift(node);
              node = parent.get(node)!;
            }
            return { path, distance: path.length - 1 };
          }
        }
      }
    }

    return null; // No path found
  }

  // DFS - Find connected components (communities)
  findCommunities(): Community[] {
    const visited = new Set<string>();
    const communities: Community[] = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

    let communityId = 0;

    for (const user of this.users) {
      if (!visited.has(user.id)) {
        const community = this.dfsVisit(user.id, visited);
        if (community.length > 0) {
          communities.push({
            id: communityId,
            users: community,
            color: colors[communityId % colors.length]
          });
          communityId++;
        }
      }
    }

    return communities;
  }

  private dfsVisit(userId: string, visited: Set<string>): string[] {
    const stack: string[] = [userId];
    const community: string[] = [];

    while (stack.length > 0) {
      const current = stack.pop()!;
      
      if (!visited.has(current)) {
        visited.add(current);
        community.push(current);

        const neighbors = this.adjacencyList.get(current) || new Set();
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
    }

    return community;
  }

  // Union-Find for efficient community detection
  findCommunitiesUnionFind(): Community[] {
    const parent = new Map<string, string>();
    const rank = new Map<string, number>();

    // Initialize
    this.users.forEach(user => {
      parent.set(user.id, user.id);
      rank.set(user.id, 0);
    });

    const find = (x: string): string => {
      if (parent.get(x) !== x) {
        parent.set(x, find(parent.get(x)!));
      }
      return parent.get(x)!;
    };

    const union = (x: string, y: string): void => {
      const rootX = find(x);
      const rootY = find(y);

      if (rootX !== rootY) {
        const rankX = rank.get(rootX)!;
        const rankY = rank.get(rootY)!;

        if (rankX < rankY) {
          parent.set(rootX, rootY);
        } else if (rankX > rankY) {
          parent.set(rootY, rootX);
        } else {
          parent.set(rootY, rootX);
          rank.set(rootX, rankX + 1);
        }
      }
    };

    // Union connected users
    this.friendships.forEach(friendship => {
      union(friendship.source, friendship.target);
    });

    // Group users by their root parent
    const groups = new Map<string, string[]>();
    this.users.forEach(user => {
      const root = find(user.id);
      if (!groups.has(root)) {
        groups.set(root, []);
      }
      groups.get(root)!.push(user.id);
    });

    // Convert to communities
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const communities: Community[] = [];
    let communityId = 0;

    groups.forEach(userIds => {
      communities.push({
        id: communityId,
        users: userIds,
        color: colors[communityId % colors.length]
      });
      communityId++;
    });

    return communities;
  }

  // Find mutual friends for friend suggestions
  findMutualFriends(userId: string): { userId: string; mutualCount: number; mutualFriends: string[] }[] {
    const userFriends = this.adjacencyList.get(userId) || new Set();
    const suggestions: { userId: string; mutualCount: number; mutualFriends: string[] }[] = [];

    for (const user of this.users) {
      if (user.id === userId || userFriends.has(user.id)) {
        continue; // Skip self and existing friends
      }

      const otherFriends = this.adjacencyList.get(user.id) || new Set();
      const mutualFriends = Array.from(userFriends).filter(friend => otherFriends.has(friend));

      if (mutualFriends.length > 0) {
        suggestions.push({
          userId: user.id,
          mutualCount: mutualFriends.length,
          mutualFriends
        });
      }
    }

    // Sort by mutual friend count (descending)
    return suggestions.sort((a, b) => b.mutualCount - a.mutualCount);
  }
}