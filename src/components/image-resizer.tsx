"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ImageResizerProps {
  editor: any;
}

export const ImageResizer = ({ editor }: ImageResizerProps) => {
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!editor) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (target.tagName === 'IMG') {
        setSelectedImage(target as HTMLImageElement);
        const rect = target.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
        });
      } else if (!target.closest('.image-resizer-controls')) {
        setSelectedImage(null);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [editor]);

  const resizeImage = (width: string) => {
    if (selectedImage) {
      selectedImage.style.width = width;
      selectedImage.style.height = 'auto';
      setSelectedImage(null);
    }
  };

  if (!selectedImage) return null;

  return (
    <div
      className="image-resizer-controls fixed z-50 flex gap-2 p-2 bg-background border rounded-lg shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      <Button
        size="sm"
        variant="outline"
        onClick={() => resizeImage('25%')}
        className="text-xs"
      >
        Small
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => resizeImage('50%')}
        className="text-xs"
      >
        Medium
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => resizeImage('75%')}
        className="text-xs"
      >
        Large
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => resizeImage('100%')}
        className="text-xs"
      >
        Full
      </Button>
    </div>
  );
};
