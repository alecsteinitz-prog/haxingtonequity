import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Youtube, BookOpen, Clock } from "lucide-react";

export const Resources = () => {
  const blogPosts = [
    {
      title: "Why Off-Market Properties Can Be the Key to High ROI Investments?",
      description: "Investing in off-market properties can be one of the most effective strategies for achieving high ROI in real estate.",
      readTime: "3 min read",
      image: "https://static.wixstatic.com/media/b3e83e_de920c05b7b741dbb96a57df8d4a0837~mv2.png/v1/fill/w_454,h_341,fp_0.50_0.50,q_95,enc_avif,quality_auto/b3e83e_de920c05b7b741dbb96a57df8d4a0837~mv2.webp",
      url: "https://www.haxingtonequity.com/post/why-off-market-properties-can-be-the-key-to-high-roi-investments"
    },
    {
      title: "How to Leverage Direct Mail to Find Off-Market Investment Opportunities?",
      description: "Direct mail remains one of the most effective methods for finding off-market investment opportunities.",
      readTime: "3 min read",
      image: "https://static.wixstatic.com/media/b3e83e_4a03c335423b4f5ba2ef46c44604983c~mv2.png/v1/fill/w_454,h_341,fp_0.50_0.50,q_95,enc_avif,quality_auto/b3e83e_4a03c335423b4f5ba2ef46c44604983c~mv2.webp",
      url: "https://www.haxingtonequity.com/post/how-to-leverage-direct-mail-to-find-off-market-investment-opportunities"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Learning Resources</h1>
        <p className="text-muted-foreground">
          Expand your real estate investment knowledge with our curated content
        </p>
      </div>

      {/* YouTube Section */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Youtube className="w-6 h-6 text-red-500" />
            <CardTitle>Haxington Equity YouTube Channel</CardTitle>
          </div>
          <CardDescription>
            Watch our latest videos on real estate investment strategies, market analysis, and expert insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.open("https://www.youtube.com/@Haxington.Equity", "_blank")}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            <Youtube className="w-4 h-4 mr-2" />
            Visit Our YouTube Channel
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Blog Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Latest Blog Posts</h2>
        </div>
        
        <div className="grid gap-4">
          {blogPosts.map((post, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-1/3">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 sm:h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
                  />
                </div>
                <div className="sm:w-2/3 p-6">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {post.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(post.url, "_blank")}
                        className="hover:bg-primary hover:text-primary-foreground"
                      >
                        Read More
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View All Blog Posts Button */}
        <div className="text-center pt-4">
          <Button 
            variant="outline"
            onClick={() => window.open("https://www.haxingtonequity.com/blog", "_blank")}
            className="hover:bg-primary hover:text-primary-foreground"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            View All Blog Posts
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Educational Topics */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Topics</CardTitle>
          <CardDescription>
            Key areas we cover in our educational content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              "Off-Market Properties",
              "Direct Mail Marketing", 
              "ROI Analysis",
              "Investment Strategies",
              "Market Analysis",
              "Property Evaluation",
              "Wholesaling",
              "Fix & Flip",
              "Buy & Hold"
            ].map((topic) => (
              <Badge key={topic} variant="secondary" className="text-sm">
                {topic}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};