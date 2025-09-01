import { GraphData, User, Friendship, GraphStats } from '@/types/graph';

const STORAGE_KEY = 'social-network-graph';

// Sample initial data
const initialData: GraphData = {
  users: [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
    { id: '3', name: 'Charlie' },
    { id: '4', name: 'Diana' },
    { id: '5', name: 'Eve' },
    { id: '6', name: 'Frank' },
  ],
  friendships: [
    { source: '1', target: '2' },
    { source: '2', target: '3' },
    { source: '3', target: '4' },
    { source: '1', target: '5' },
    { source: '5', target: '6' },
  ]
};

export class GraphDataManager {
  private data: GraphData;
  private listeners: (() => void)[] = [];

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): GraphData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
    return { ...initialData };
  }

  private saveData(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // Subscribe to data changes
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Get current data
  getData(): GraphData {
    return { ...this.data };
  }

  // Get statistics
  getStats(): GraphStats {
    return {
      totalUsers: this.data.users.length,
      totalFriendships: this.data.friendships.length,
      totalCommunities: 0 // Will be calculated by algorithms
    };
  }

  // User management
  addUser(name: string): User {
    const id = Date.now().toString();
    const user: User = { id, name };
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  removeUser(userId: string): boolean {
    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    // Remove user
    this.data.users.splice(userIndex, 1);

    // Remove all friendships involving this user
    this.data.friendships = this.data.friendships.filter(
      f => f.source !== userId && f.target !== userId
    );

    this.saveData();
    return true;
  }

  updateUser(userId: string, name: string): boolean {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return false;

    user.name = name;
    this.saveData();
    return true;
  }

  // Friendship management
  addFriendship(sourceId: string, targetId: string): boolean {
    // Check if users exist
    const sourceExists = this.data.users.some(u => u.id === sourceId);
    const targetExists = this.data.users.some(u => u.id === targetId);
    
    if (!sourceExists || !targetExists || sourceId === targetId) {
      return false;
    }

    // Check if friendship already exists
    const exists = this.data.friendships.some(
      f => (f.source === sourceId && f.target === targetId) ||
           (f.source === targetId && f.target === sourceId)
    );

    if (exists) return false;

    this.data.friendships.push({ source: sourceId, target: targetId });
    this.saveData();
    return true;
  }

  removeFriendship(sourceId: string, targetId: string): boolean {
    const initialLength = this.data.friendships.length;
    
    this.data.friendships = this.data.friendships.filter(
      f => !((f.source === sourceId && f.target === targetId) ||
            (f.source === targetId && f.target === sourceId))
    );

    if (this.data.friendships.length < initialLength) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Get user by ID
  getUser(userId: string): User | undefined {
    return this.data.users.find(u => u.id === userId);
  }

  // Get all users
  getUsers(): User[] {
    return [...this.data.users];
  }

  // Get all friendships
  getFriendships(): Friendship[] {
    return [...this.data.friendships];
  }

  // Reset to initial data
  reset(): void {
    this.data = { ...initialData };
    this.saveData();
  }

  // Import data
  importData(data: GraphData): boolean {
    try {
      // Basic validation
      if (!data.users || !data.friendships || !Array.isArray(data.users) || !Array.isArray(data.friendships)) {
        return false;
      }

      this.data = { ...data };
      this.saveData();
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Export data
  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }
}

// Singleton instance
export const graphDataManager = new GraphDataManager();