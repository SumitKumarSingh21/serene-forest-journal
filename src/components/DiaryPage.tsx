import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Trash2, Image, Video, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiaryEntry {
  date: string;
  title: string;
  content: string;
  media: string[];
  timestamp: number;
}

interface DiaryPageProps {
  date: string;
  entry?: DiaryEntry;
  onSave: (entry: DiaryEntry) => void;
  onDelete: () => void;
  onBack: () => void;
}

export default function DiaryPage({ date, entry, onSave, onDelete, onBack }: DiaryPageProps) {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [media, setMedia] = useState<string[]>(entry?.media || []);
  const [isVisible, setIsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsVisible(true);
    // Auto-focus on content area
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 300);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSave = async () => {
    if (!content.trim() && !title.trim() && media.length === 0) return;
    
    setIsSaving(true);
    
    const entryData: DiaryEntry = {
      date,
      title: title.trim(),
      content: content.trim(),
      media,
      timestamp: Date.now()
    };
    
    try {
      onSave(entryData);
      // Show save success briefly
      setTimeout(() => setIsSaving(false), 1000);
    } catch (error) {
      console.error('Failed to save entry:', error);
      setIsSaving(false);
    }
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setMedia(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this diary entry? This action cannot be undone.')) {
      onDelete();
      onBack();
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center p-4",
      "transform transition-all duration-700 ease-out",
      isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
    )}>
      <div className="glass-panel rounded-3xl w-full max-w-4xl h-full max-h-[90vh] 
                      flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-golden-warm/20">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-3 rounded-xl bg-forest-medium/20 hover:bg-forest-medium/30 
                       text-golden-soft hover:text-golden-glow transition-all duration-300
                       backdrop-blur-sm border border-forest-medium/30"
            >
              <ArrowLeft size={20} />
            </button>
            
            <div className="flex items-center space-x-3">
              <Calendar size={20} className="text-golden-warm" />
              <h1 className="text-xl font-semibold text-golden-soft">
                {formatDate(date)}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl bg-nature-accent/20 hover:bg-nature-accent/30 
                       text-nature-accent hover:text-golden-warm transition-all duration-300
                       backdrop-blur-sm border border-nature-accent/30"
              title="Add photos or videos"
            >
              <Image size={20} />
            </button>

            {entry && (
              <button
                onClick={handleDelete}
                className="p-3 rounded-xl bg-destructive/20 hover:bg-destructive/30 
                         text-destructive hover:text-destructive-foreground transition-all duration-300
                         backdrop-blur-sm border border-destructive/30"
                title="Delete entry"
              >
                <Trash2 size={20} />
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "px-6 py-3 rounded-xl font-medium transition-all duration-300",
                "backdrop-blur-sm border",
                isSaving
                  ? "bg-golden-warm/30 text-golden-soft border-golden-warm/30 cursor-not-allowed"
                  : "bg-golden-warm hover:bg-golden-glow text-primary-foreground border-golden-warm/50"
              )}
            >
              <div className="flex items-center space-x-2">
                <Save size={18} />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Title Input */}
          <input
            type="text"
            placeholder="Give your day a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-bold bg-transparent border-none outline-none 
                     text-golden-soft placeholder-forest-mist/60 mb-6
                     focus:placeholder-forest-mist/40 transition-colors duration-300"
          />

          {/* Content Textarea */}
          <textarea
            ref={textareaRef}
            placeholder="How was your day? What are you thinking about? Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 bg-transparent border-none outline-none resize-none
                     text-golden-soft placeholder-forest-mist/60 text-lg leading-relaxed
                     focus:placeholder-forest-mist/40 transition-colors duration-300"
          />

          {/* Media Gallery */}
          {media.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-golden-soft mb-4">
                Memories from this day
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {media.map((item, index) => (
                  <div key={index} className="relative group">
                    {item.startsWith('data:image/') ? (
                      <img
                        src={item}
                        alt={`Memory ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg shadow-lg"
                      />
                    ) : (
                      <video
                        src={item}
                        className="w-full h-40 object-cover rounded-lg shadow-lg"
                        controls
                      />
                    )}
                    <button
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 p-1 rounded-full 
                               bg-destructive/80 text-destructive-foreground
                               opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Word Count */}
        <div className="px-6 py-3 border-t border-golden-warm/20 text-sm text-forest-mist">
          {content.trim().split(/\s+/).filter(word => word.length > 0).length} words
          {media.length > 0 && ` • ${media.length} ${media.length === 1 ? 'memory' : 'memories'}`}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleMediaUpload}
        className="hidden"
      />
    </div>
  );
}