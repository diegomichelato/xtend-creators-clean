import { Creator } from "@shared/schema";
import { getInitials } from "@/lib/utils";
import { useLocation } from "wouter";
import { Pencil, Trash2, Youtube, Instagram, Music, Facebook } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface CreatorCardProps {
  creator: Creator;
  selected?: boolean;
  selectable?: boolean;
  onSelect?: () => void;
  onEdit?: (creator: Creator) => void;
  onDelete?: (id: number) => void;
}

export function CreatorCard({ 
  creator, 
  selected = false, 
  selectable = true, 
  onSelect, 
  onEdit, 
  onDelete 
}: CreatorCardProps) {
  const [, navigate] = useLocation();
  const initials = creator.initials || getInitials(creator.name);
  const formattedDate = creator.lastUpdated 
    ? new Date(creator.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Not updated';
  
  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect();
    } else if (!selectable) {
      navigate(`/creators/${creator.id}`);
    }
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(creator);
    }
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(creator.id);
    }
  };
  
  return (
    <div 
      className={`bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group cursor-pointer border border-gray-100 ${
        selected ? 'ring-2 ring-primary/50 bg-primary/5' : ''
      }`}
      onClick={handleClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50"></div>
      
      <div className="relative z-10 text-center">
        {/* Profile Image */}
        <div className="w-24 h-24 mx-auto mb-4 relative">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden">
            {creator.profileImageUrl ? (
              <img 
                src={creator.profileImageUrl} 
                alt={creator.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                {initials}
              </div>
            )}
          </div>
        </div>

        {/* Creator Name */}
        <h3 className="text-xl font-bold mb-1 text-gray-900">{creator.name}</h3>
        
        {/* Platform Stats */}
        <div className="flex justify-center gap-4 mb-4 text-sm text-gray-700">
          {creator.performance?.youtube?.subscribers && (
            <div className="flex items-center gap-1">
              <Youtube className="h-4 w-4 text-red-500" />
              <span>{creator.performance.youtube.subscribers}</span>
            </div>
          )}
          {creator.performance?.instagram?.followers && (
            <div className="flex items-center gap-1">
              <Instagram className="h-4 w-4 text-pink-500" />
              <span>{creator.performance.instagram.followers}</span>
            </div>
          )}
          {creator.performance?.tiktok?.followers && (
            <div className="flex items-center gap-1">
              <Music className="h-4 w-4 text-gray-600" />
              <span>{creator.performance.tiktok.followers}</span>
            </div>
          )}
          {creator.performance?.facebook?.followers && (
            <div className="flex items-center gap-1">
              <Facebook className="h-4 w-4 text-blue-500" />
              <span>{creator.performance.facebook.followers}</span>
            </div>
          )}
        </div>

        {/* Role Badge */}
        <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-4">
          {creator.role || 'Creator'}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/creators/${creator.id}`);
            }}
          >
            Open Media Kit
          </Button>

          {/* Edit/Delete Actions for non-selectable cards */}
          {!selectable && onEdit && onDelete && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-gray-600 hover:bg-gray-100"
                onClick={handleEdit}
                title="Edit creator"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-red-500 hover:bg-red-50 hover:text-red-600"
                    title="Delete creator"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the creator <strong>{creator.name}</strong> and cannot be undone.
                      All email accounts associated with this creator will remain in the system.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {/* Selection Indicator for selectable cards */}
        {selectable && (
          <div className="absolute top-4 right-4">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              selected 
                ? 'border-primary bg-primary text-white scale-110' 
                : 'border-gray-300 group-hover:border-primary group-hover:bg-primary/10'
            }`}>
              {selected && (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
