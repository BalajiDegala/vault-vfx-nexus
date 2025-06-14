
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Download, GalleryHorizontal, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

interface PortfolioItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string | null;
  file_url: string | null;
  category: string;
  tags: string[];
  created_at: string;
}

const defaultCategories = [
  "All", "3D Animation", "VFX", "Motion Graphics", "Concept Art", "Modeling", "Texturing", "General"
];

export default function PortfolioPage() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("user") || "";
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [filtered, setFiltered] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PortfolioItem | null>(null);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    if (!userId) return;
    fetchPortfolio();
  }, [userId]);

  useEffect(() => {
    if (category === "All") setFiltered(portfolio);
    else setFiltered(portfolio.filter(item => item.category === category));
  }, [category, portfolio]);

  async function fetchPortfolio() {
    setLoading(true);
    const { data: items } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setPortfolio(items || []);

    const { data: prof } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_url")
      .eq("id", userId)
      .single();
    setProfile(prof || null);

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8 flex gap-4 items-center">
          <Link to="/profiles?user={userId}" className="flex items-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full border" />
            ) : (
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-xl font-bold text-gray-300">
                ?
              </div>
            )}
            <div className="ml-4">
              <h1 className="text-2xl font-semibold text-white">{profile?.first_name} {profile?.last_name}</h1>
              <span className="text-gray-400 text-sm">/portfolio</span>
            </div>
          </Link>
        </div>

        <div className="mb-6 flex gap-3 flex-wrap">
          {defaultCategories.map(cat => (
            <Button
              key={cat}
              onClick={() => setCategory(cat)}
              variant={category === cat ? "secondary" : "outline"}
              size="sm"
              className={category === cat ? "bg-blue-600 text-white border-blue-400 shadow" : ""}
            >
              {cat}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-white flex items-center gap-3 mt-10">
            <Loader2 className="animate-spin" />
            Loading portfolio...
          </div>
        ) : (
          <>
            {filtered.length === 0 ? (
              <div className="bg-gray-900/80 rounded-lg p-10 text-center text-gray-400 flex flex-col items-center">
                <GalleryHorizontal className="w-12 h-12 mb-1" />
                No portfolio items found for this user.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(item => (
                  <Card key={item.id} className="bg-gray-900/90 border-gray-700 group">
                    <CardContent className="p-3 flex flex-col h-full">
                      <div className="relative aspect-video rounded overflow-hidden mb-3">
                        {item.image_url ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="object-cover w-full h-full cursor-pointer group-hover:opacity-90 transition"
                                onClick={() => setSelected(item)}
                              />
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl bg-gray-950 border-gray-700">
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-full rounded-lg shadow"
                              />
                              {item.description && (
                                <div className="mt-4">{item.description}</div>
                              )}
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="flex items-center justify-center h-full w-full text-gray-400">
                            <Eye className="h-10 w-10" />
                          </div>
                        )}
                        {item.file_url && !item.image_url && (
                          <video className="object-cover w-full h-full" controls>
                            <source src={item.file_url} />
                            Not supported
                          </video>
                        )}
                        <div className="absolute right-2 bottom-2 z-10">
                          {item.file_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              asChild
                              aria-label="Download file"
                            >
                              <a href={item.file_url} download>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-semibold text-white">{item.title}</h4>
                        <div className="flex flex-wrap gap-2 items-center mt-2">
                          <Badge className="bg-blue-700/20 text-blue-400">{item.category}</Badge>
                          {item.tags?.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-gray-600 text-gray-400">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        {item.description && (
                          <div className="text-gray-400 text-xs mt-2 line-clamp-2">{item.description}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
