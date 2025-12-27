"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Code,
  Palette,
  PenTool,
  Megaphone,
  HeadphonesIcon,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Eye,
  X,
  Loader2,
  FileText
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Web Dev": Code,
  "Design": Palette,
  "Writing": PenTool,
  "Marketing": Megaphone,
  "VA": HeadphonesIcon,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Web Dev": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Design": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "Writing": "bg-green-500/10 text-green-500 border-green-500/20",
  "Marketing": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "VA": "bg-pink-500/10 text-pink-500 border-pink-500/20",
};

export default function TemplatesPage() {
  const router = useRouter();
  const templates = useQuery(api.templates.getAllTemplates);
  const seedTemplates = useMutation(api.templates.seedTemplates);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<NonNullable<typeof templates>[number] | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Seed templates if none exist
  useEffect(() => {
    if (templates && templates.length === 0 && !isSeeding) {
      setIsSeeding(true);
      seedTemplates({})
        .then(() => {
          toast.success("Templates loaded!");
        })
        .catch((error) => {
          console.error("Failed to seed templates:", error);
        })
        .finally(() => {
          setIsSeeding(false);
        });
    }
  }, [templates, seedTemplates, isSeeding]);

  const categories = ["all", "Web Dev", "Design", "Writing", "Marketing", "VA"];
  
  const filteredTemplates = templates?.filter(
    (t: NonNullable<typeof templates>[number]) => selectedCategory === "all" || t.category === selectedCategory
  ) || [];

  const handleUseTemplate = (template: NonNullable<typeof templates>[number]) => {
    // Navigate to generator with template info in URL
    const params = new URLSearchParams({
      template: template.name,
      tone: template.tone,
      category: template.category,
    });
    router.push(`/dashboard/new?${params.toString()}`);
    toast.success(`Using "${template.name}" template`);
  };

  if (!templates) {
    return (
      <>
        <Header 
          title="Template Library"
          subtitle="Pre-built proposal templates for common freelance niches"
        />
        <main className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header 
        title="Template Library"
        subtitle="Pre-built proposal templates for common freelance niches"
      />
      
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="flex-wrap h-auto gap-2 bg-transparent p-0">
            {categories.map((category) => {
              const Icon = category === "all" ? FileText : CATEGORY_ICONS[category];
              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg border border-border flex items-center gap-2 whitespace-nowrap min-w-0"
                >
                  {Icon && <Icon className="w-4 h-4 shrink-0" />}
                  <span className="truncate">{category === "all" ? "All Templates" : category}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              {isSeeding ? "Loading templates..." : "Try selecting a different category"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template: NonNullable<typeof filteredTemplates>[number]) => {
              const Icon = CATEGORY_ICONS[template.category] || FileText;
              const colorClass = CATEGORY_COLORS[template.category] || "bg-muted text-muted-foreground";
              
              return (
                <Card key={template._id} className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {template.successRate}% success
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 4).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 4}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Tone indicator */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="w-4 h-4" />
                      <span className="capitalize">{template.tone} tone</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use Template
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Preview Modal */}
        {previewTemplate && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <Card 
              className="w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{previewTemplate.name}</CardTitle>
                    <CardDescription>{previewTemplate.description}</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setPreviewTemplate(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-[50vh] py-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                    Template Preview
                  </p>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed bg-muted/50 p-4 rounded-lg border">
                    {previewTemplate.preview}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/30">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      {previewTemplate.successRate}% success rate
                    </span>
                    <span className="capitalize">{previewTemplate.tone} tone</span>
                  </div>
                  <Button 
                    className="gap-2"
                    onClick={() => {
                      handleUseTemplate(previewTemplate);
                      setPreviewTemplate(null);
                    }}
                  >
                    Use This Template
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
    </>
  );
}

