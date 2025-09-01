import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Route, ArrowRight } from 'lucide-react';
import { User, PathResult } from '@/types/graph';

interface PathFinderProps {
  users: User[];
  onFindPath: (startId: string, endId: string) => PathResult | null;
  onHighlightPath: (path: string[]) => void;
  onClearPath: () => void;
  currentPath?: PathResult | null;
}

const PathFinder: React.FC<PathFinderProps> = ({
  users,
  onFindPath,
  onHighlightPath,
  onClearPath,
  currentPath
}) => {
  const [startUser, setStartUser] = useState('');
  const [endUser, setEndUser] = useState('');

  const handleFindPath = () => {
    if (startUser && endUser && startUser !== endUser) {
      const result = onFindPath(startUser, endUser);
      if (result) {
        onHighlightPath(result.path);
      }
    }
  };

  const handleClear = () => {
    onClearPath();
    setStartUser('');
    setEndUser('');
  };

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || userId;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Find Shortest Path
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">From</label>
            <Select value={startUser} onValueChange={setStartUser}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select start user" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">To</label>
            <Select value={endUser} onValueChange={setEndUser}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select end user" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleFindPath}
            disabled={!startUser || !endUser || startUser === endUser}
            className="flex-1"
          >
            Find Path
          </Button>
          <Button onClick={handleClear} variant="outline">
            Clear
          </Button>
        </div>

        {currentPath && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Shortest Path Found! (Distance: {currentPath.distance})
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              {currentPath.path.map((userId, index) => (
                <React.Fragment key={userId}>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {getUserName(userId)}
                  </Badge>
                  {index < currentPath.path.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {startUser && endUser && startUser !== endUser && !currentPath && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <p className="text-red-800">
              No path found between {getUserName(startUser)} and {getUserName(endUser)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PathFinder;