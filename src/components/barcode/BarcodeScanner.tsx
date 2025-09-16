import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X, Flashlight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeScanned: (barcode: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onBarcodeScanned }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: "environment" }, // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setIsScanning(true);
      startBarcodeDetection();
    } catch (error) {
      console.error("Camera access denied:", error);
      setHasPermission(false);
      toast({
        title: "Camera Access Required",
        description: "Please allow camera access to scan barcodes.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
    setHasPermission(null);
  };

  const startBarcodeDetection = () => {
    // Simple barcode detection using canvas
    const detectBarcode = () => {
      if (!videoRef.current || !isScanning) return;

      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // For demo purposes, we'll simulate barcode detection
      // In a real app, you'd use a proper barcode detection library
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simulate finding a barcode (this is just for demo)
      if (Math.random() > 0.98) { // 2% chance per frame
        const mockBarcode = "1234567890123"; // Mock EAN-13 barcode
        onBarcodeScanned(mockBarcode);
        onClose();
        toast({
          title: "Barcode Scanned",
          description: `Found barcode: ${mockBarcode}`,
        });
        return;
      }

      // Continue scanning
      if (isScanning) {
        requestAnimationFrame(detectBarcode);
      }
    };

    // Start detection after a small delay
    setTimeout(detectBarcode, 1000);
  };

  const handleManualEntry = () => {
    const barcode = prompt("Enter barcode manually:");
    if (barcode) {
      onBarcodeScanned(barcode);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Barcode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {hasPermission === false ? (
            <div className="text-center py-8">
              <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Camera access is required to scan barcodes. Please enable camera permissions and try again.
              </p>
              <Button onClick={startCamera}>
                Enable Camera
              </Button>
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black rounded-lg object-cover"
                autoPlay
                muted
                playsInline
              />
              
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-primary rounded-lg w-48 h-32">
                    <div className="w-full h-full border border-dashed border-primary/50 rounded-lg animate-pulse" />
                  </div>
                </div>
              )}

              <div className="absolute top-2 right-2">
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={handleManualEntry}>
              Enter Manually
            </Button>
            {hasPermission && (
              <Button variant="outline" size="icon">
                <Flashlight className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Point your camera at a barcode to scan it automatically
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}