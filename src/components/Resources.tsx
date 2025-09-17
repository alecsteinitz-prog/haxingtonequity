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
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Learning Resources</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Expand your real estate investment knowledge with our curated content and expert insights
        </p>
      </div>

      {/* Blog Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 pb-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">Latest Blog Posts</h2>
        </div>
        
        <div className="grid gap-8">
          {blogPosts.map((post, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-lg">
              <div className="flex flex-col lg:flex-row overflow-hidden">
                <div className="lg:w-2/5">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-64 lg:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="lg:w-3/5 p-8 lg:p-10">
                  <CardHeader className="p-0 pb-6">
                    <CardTitle className="text-xl lg:text-2xl font-semibold group-hover:text-primary transition-colors duration-200 leading-tight">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground leading-relaxed mt-3">
                      {post.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </div>
                      <Button 
                        variant="outline" 
                        size="default"
                        onClick={() => window.open(post.url, "_blank")}
                        className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 px-6"
                      >
                        Read More
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View All Blog Posts Button */}
        <div className="text-center pt-8">
          <Button 
            variant="outline"
            size="lg"
            onClick={() => window.open("https://www.haxingtonequity.com/blog", "_blank")}
            className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 px-8 py-6"
          >
            <BookOpen className="w-5 h-5 mr-3" />
            View All Blog Posts
            <ExternalLink className="w-5 h-5 ml-3" />
          </Button>
        </div>
      </div>

      {/* Educational Topics */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-8 pt-8 px-8">
          <CardTitle className="text-2xl font-semibold">Popular Topics</CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-2 leading-relaxed">
            Key areas we cover in our educational content to help you succeed in real estate investing
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="flex flex-wrap gap-3">
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
              <Badge 
                key={topic} 
                variant="secondary" 
                className="text-sm px-4 py-2 font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-200 cursor-pointer"
              >
                {topic}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};