import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, UserPlus, Users } from 'lucide-react';
import { User } from '@/types/graph';

interface UserManagementProps {
  users: User[];
  onAddUser: (name: string) => void;
  onRemoveUser: (userId: string) => void;
  onAddFriendship: (sourceId: string, targetId: string) => void;
  onRemoveFriendship: (sourceId: string, targetId: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onAddUser,
  onRemoveUser,
  onAddFriendship,
  onRemoveFriendship
}) => {
  const [newUserName, setNewUserName] = useState('');
  const [friendshipSource, setFriendshipSource] = useState('');
  const [friendshipTarget, setFriendshipTarget] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName.trim()) {
      onAddUser(newUserName.trim());
      setNewUserName('');
    }
  };

  const handleAddFriendship = (e: React.FormEvent) => {
    e.preventDefault();
    if (friendshipSource && friendshipTarget && friendshipSource !== friendshipTarget) {
      onAddFriendship(friendshipSource, friendshipTarget);
      setFriendshipSource('');
      setFriendshipTarget('');
    }
  };

  const handleRemoveFriendship = (e: React.FormEvent) => {
    e.preventDefault();
    if (friendshipSource && friendshipTarget) {
      onRemoveFriendship(friendshipSource, friendshipTarget);
      setFriendshipSource('');
      setFriendshipTarget('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUser} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="userName">User Name</Label>
              <Input
                id="userName"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter user name"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={!newUserName.trim()}>
                Add User
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Manage Friendships */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Friendships
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="friendshipSource">User 1</Label>
              <Select value={friendshipSource} onValueChange={setFriendshipSource}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select first user" />
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
              <Label htmlFor="friendshipTarget">User 2</Label>
              <Select value={friendshipTarget} onValueChange={setFriendshipTarget}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select second user" />
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
              onClick={handleAddFriendship}
              disabled={!friendshipSource || !friendshipTarget || friendshipSource === friendshipTarget}
              className="flex-1"
            >
              Add Friendship
            </Button>
            <Button 
              onClick={handleRemoveFriendship}
              disabled={!friendshipSource || !friendshipTarget || friendshipSource === friendshipTarget}
              variant="destructive"
              className="flex-1"
            >
              Remove Friendship
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No users yet. Add some users to get started!</p>
          ) : (
            <div className="space-y-2">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{user.name}</span>
                  <Button
                    onClick={() => onRemoveUser(user.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;