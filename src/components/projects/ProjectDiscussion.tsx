
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, AtSign } from "lucide-react";

const ProjectDiscussion = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Team Discussion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-300">
              Collaborate with your team using real-time messaging. Share updates, ask questions, and coordinate work.
            </p>
            
            {/* Mock conversation */}
            <div className="space-y-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700 max-h-80 overflow-y-auto">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  JD
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">John Doe</span>
                    <span className="text-gray-400 text-xs">2 hours ago</span>
                  </div>
                  <p className="text-gray-300 text-sm">Hey team, I've uploaded the initial concept art for sequence 01. Looking forward to your feedback!</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  SM
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">Sarah Miller</span>
                    <span className="text-gray-400 text-xs">1 hour ago</span>
                  </div>
                  <p className="text-gray-300 text-sm">Great work @john! The lighting direction looks perfect for the mood we're going for.</p>
                </div>
              </div>
            </div>

            {/* Chat input */}
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type your message..."
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-medium mb-2">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Update
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <AtSign className="h-4 w-4 mr-2" />
                  @Mention Team
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDiscussion;
