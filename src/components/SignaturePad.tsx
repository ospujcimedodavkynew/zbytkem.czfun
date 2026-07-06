import React, { useRef, useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Edit3 } from 'lucide-react';

interface SignaturePadProps {
  onSave: (base64Image: string) => void;
  savedSignature?: string;
  placeholderText?: string;
}

export default function SignaturePad({ onSave, savedSignature, placeholderText = "Sem nakreslete svůj podpis" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!savedSignature);
  const [strokeColor, setStrokeColor] = useState('#1e293b'); // slate-800

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set high-DPI scaling for crisp lines
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Only scale if dimensions changed
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          canvas.width = rect.width;
          canvas.height = rect.height;
          
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.lineWidth = 3;
          ctx.strokeStyle = strokeColor;
          
          // Re-draw saved signature if any and canvas was resized
          if (savedSignature) {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0, rect.width, rect.height);
            };
            img.src = savedSignature;
          }
        }
      }
    };

    resizeCanvas();
    
    // Resize observer to ensure signature is scaled nicely if the container changes
    const observer = new ResizeObserver(() => resizeCanvas());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [savedSignature]);

  const getCoordinates = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    
    // Check if it's touch
    if ('touches' in e && e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    return null;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent scrolling on touch devices
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const coords = getCoordinates(e.nativeEvent);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (e.cancelable) {
      e.preventDefault();
    }

    const coords = getCoordinates(e.nativeEvent);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setIsEmpty(false);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Auto-save the drawn signature
    saveSignature();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onSave(''); // Notify parent that it is cleared
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    } catch (err) {
      console.error('Error saving canvas signature', err);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div 
        ref={containerRef}
        className="relative w-full h-48 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden focus-within:border-primary transition-all cursor-crosshair touch-none"
      >
        {savedSignature && isEmpty ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <img 
              src={savedSignature} 
              alt="Saved signature" 
              className="max-h-full max-w-full object-contain pointer-events-none" 
            />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="absolute inset-0 w-full h-full"
          />
        )}

        {isEmpty && !savedSignature && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 gap-2">
            <Edit3 className="w-5 h-5 opacity-60" />
            <span className="text-sm font-medium">{placeholderText}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center px-1">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          {!isEmpty || savedSignature ? (
            <span className="text-green-600 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Podpis zaznamenán
            </span>
          ) : (
            "Prstem na displeji nebo myší nakreslete podpis"
          )}
        </span>
        
        <button
          type="button"
          onClick={clearCanvas}
          className="text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1 py-1 px-2 rounded-md hover:bg-slate-100"
        >
          <RefreshCw className="w-3 h-3" /> Smazat podpis
        </button>
      </div>
    </div>
  );
}
