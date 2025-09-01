import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Network, Route, Download, Upload, RotateCcw } from 'lucide-react';

import GraphVisualization from '@/components/GraphVisualization';
import UserManagement from '@/components/UserManagement';
import PathFinder from '@/components/PathFinder';

import { graphDataManager } from '@/utils/graphData';
import { GraphAlgorithms } from '@/utils/graphAlgorithms';
import { User, Friendship, Community, PathResult, GraphStats } from '@/types/graph';

export default function SocialNetworkAnalyzer() {
  const [users, setUsers] = useState<User[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<PathResult | null>(null);
  const [stats, setStats] = useState<GraphStats>({ totalUsers: 0, totalFriendships: 0, totalCommunities: 0 });

  // Load initial data and subscribe to changes
  useEffect(() => {
    const loadData = () => {
      const data = graphDataManager.getData();
      setUsers(data.users);
      setFriendships(data.friendships);
      updateAnalytics(data.users, data.friendships);
    };

    loadData();
    const unsubscribe = graphDataManager.subscribe(loadData);
    return unsubscribe;
  }, []);

  const updateAnalytics = (currentUsers: User[], currentFriendships: Friendship[]) => {
    if (currentUsers.length === 0) {
      setCommunities([]);
      setStats({ totalUsers: 0, totalFriendships: 0, totalCommunities: 0 });
      return;
    }

    const algorithms = new GraphAlgorithms(currentUsers, currentFriendships);
    const detectedCommunities = algorithms.findCommunities();
    
    setCommunities(detectedCommunities);
    setStats({
      totalUsers: currentUsers.length,
      totalFriendships: currentFriendships.length,
      totalCommunities: detectedCommunities.length
    });
  };

  // User management handlers
  const handleAddUser = (name: string) => {
    graphDataManager.addUser(name);
  };

  const handleRemoveUser = (userId: string) => {
    graphDataManager.removeUser(userId);
    // Clear path if it involves removed user
    if (highlightedPath.includes(userId)) {
      setHighlightedPath([]);
      setCurrentPath(null);
    }
  };

  const handleAddFriendship = (sourceId: string, targetId: string) => {
    const success = graphDataManager.addFriendship(sourceId, targetId);
    if (!success) {
      alert('Friendship already exists or invalid users!');
    }
  };

  const handleRemoveFriendship = (sourceId: string, targetId: string) => {
    graphDataManager.removeFriendship(sourceId, targetId);
  };

  // Path finding handlers
  const handleFindPath = (startId: string, endId: string): PathResult | null => {
    const algorithms = new GraphAlgorithms(users, friendships);
    const result = algorithms.findShortestPath(startId, endId);
    setCurrentPath(result);
    return result;
  };

  const handleHighlightPath = (path: string[]) => {
    setHighlightedPath(path);
  };

  const handleClearPath = () => {
    setHighlightedPath([]);
    setCurrentPath(null);
  };

  // Data management
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data?')) {
      graphDataManager.reset();
      setHighlightedPath([]);
      setCurrentPath(null);
    }
  };

  const handleExport = () => {
    const data = graphDataManager.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'social-network-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const success = graphDataManager.importData(data);
        if (success) {
          alert('Data imported successfully!');
        } else {
          alert('Invalid data format!');
        }
      } catch (error) {
        alert('Error importing data!');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Social Network Graph Analyzer
          </h1>
          <p className="text-gray-600">
            Visualize social connections and analyze network patterns with graph algorithms
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Network className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Friendships</p>
                  <p className="text-2xl font-bold">{stats.totalFriendships}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Route className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Communities</p>
                  <p className="text-2xl font-bold">{stats.totalCommunities}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex gap-1">
                <Button onClick={handleReset} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button onClick={handleExport} variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span><Upload className="h-4 w-4" /></span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph Visualization */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Network Visualization</CardTitle>
                {communities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {communities.map(community => (
                      <Badge 
                        key={community.id} 
                        style={{ backgroundColor: community.color, color: 'white' }}
                      >
                        Community {community.id + 1} ({community.users.length} users)
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <GraphVisualization
                  users={users}
                  friendships={friendships}
                  communities={communities}
                  highlightedPath={highlightedPath}
                  width={700}
                  height={500}
                />
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div>
            <Tabs defaultValue="users" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users">Manage</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="users">
                <UserManagement
                  users={users}
                  onAddUser={handleAddUser}
                  onRemoveUser={handleRemoveUser}
                  onAddFriendship={handleAddFriendship}
                  onRemoveFriendship={handleRemoveFriendship}
                />
              </TabsContent>
              
              <TabsContent value="analysis">
                <PathFinder
                  users={users}
                  onFindPath={handleFindPath}
                  onHighlightPath={handleHighlightPath}
                  onClearPath={handleClearPath}
                  currentPath={currentPath}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}