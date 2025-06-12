
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Trash2, Eye, Download, Plus } from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio";
import PortfolioUploadModal from "./PortfolioUploadModal";

interface PortfolioGridProps {
  userId: string;
  isOwnProfile: boolean;
}

const PortfolioGrid = ({ userId, isOwnProfile }: PortfolioGridProps) => {
  const { items, loading, deletePortfolioItem, refreshItems } = usePortfolio(userId);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-gray-900/80 border-gray-600 animate-pulse">
            <CardContent className="p-6">
              <div className="aspect-video bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Portfolio ({items.length})</h3>
        {isOwnProfile && (
          <Button onClick={() => setShowUploadModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="bg-gray-900/80 border-gray-600 group hover:border-blue-500/50 transition-colors">
            <CardContent className="p-4">
              <div className="aspect-video bg-gray-800 rounded mb-4 overflow-hidden relative">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <Eye className="h-8 w-8" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="secondary" onClick={() => setSelectedItem(item)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                  
                  {item.file_url && (
                    <Button size="sm" variant="secondary" asChild>
                      <a href={item.file_url} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  
                  {isOwnProfile && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deletePortfolioItem(item.id, item.file_url || '')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <h4 className="font-semibold text-white mb-2">{item.title}</h4>
              {item.description && (
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  {item.category}
                </Badge>
                {item.featured && (
                  <Badge className="bg-yellow-500/20 text-yellow-400">
                    Featured
                  </Badge>
                )}
              </div>
              
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-400">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                      +{item.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {items.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No portfolio items yet</p>
            {isOwnProfile && (
              <Button onClick={() => setShowUploadModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Portfolio Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl bg-gray-900 border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedItem?.title}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {selectedItem.image_url && (
                <img 
                  src={selectedItem.image_url} 
                  alt={selectedItem.title}
                  className="w-full rounded-lg"
                />
              )}
              {selectedItem.description && (
                <p className="text-gray-300">{selectedItem.description}</p>
              )}
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/20 text-blue-400">{selectedItem.category}</Badge>
                {selectedItem.tags?.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="border-gray-600 text-gray-400">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <PortfolioUploadModal 
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        userId={userId}
        onSuccess={() => {
          setShowUploadModal(false);
          refreshItems();
        }}
      />
    </div>
  );
};

export default PortfolioGrid;
