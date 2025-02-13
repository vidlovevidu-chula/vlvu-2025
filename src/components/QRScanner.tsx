import React, { useEffect, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";

interface QRScannerProps {
  user_id: string | undefined;
}

const QRScanner: React.FC<QRScannerProps> = ({ user_id }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = document.getElementById("video") as HTMLVideoElement;
    const codeReader = new BrowserQRCodeReader();

    const handleStampScan = async (boothId: string) => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/stamp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uID: user_id,
            boothId: boothId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          window.location.href = `/ticket-stamp/stamp/${user_id}`;
        } else {
          setError(data.message || "Failed to collect stamp");
        }
      } catch (error) {
        console.error("Error processing stamp:", error);
        setError("Error processing stamp");
      } finally {
        setIsLoading(false);
      }
    };

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "environment",
        },
      })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
        setIsLoading(false);

        codeReader.decodeFromVideoDevice(undefined, "video", (result, err) => {
          if (result) {
            const scannedText = result.getText();
            console.log("Scanned text:", scannedText); // Debug log
            let boothname = "";

            // Use forward slashes and handle spaces in URLs
            const stampPaths: { [key: string]: string } = {
              "vlvu-2025/public/stamp/sugar sugar train.webp": "boot1",
              "vlvu-2025/public/stamp/harmony tales.webp": "boot2",
              "vlvu-2025/public/stamp/bouquet of scent.webp": "boot3",
              "vlvu-2025/public/stamp/lost letters of love.webp": "boot4",
              "vlvu-2025/public/stamp/next station love.webp": "boot5",
              "vlvu-2025/public/stamp/see something I lost in the beach.webp":
                "boot6",
              "vlvu-2025/public/stamp/one shot.webp": "boot7",
              "vlvu-2025/public/stamp/you and me and me.webp": "boot8",
            };

            // Normalize the scanned text to use forward slashes
            const normalizedPath = scannedText.replace(/\\/g, "/");
            boothname = stampPaths[normalizedPath] || "";

            if (boothname) {
              console.log("Matched booth:", boothname); // Debug log
              handleStampScan(boothname);
            } else {
              console.log("No matching booth found"); // Debug log
              setError("Invalid QR code");
            }
          }
          if (err && err.name !== "NotFoundException") {
            console.error(err);
          }
        });
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to access camera");
        setIsLoading(false);
      });

    // Cleanup function
    return () => {
      if (video.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [user_id]);

  return (
    <div className="scanner-box">
      {isLoading && <div className="loading">Initializing camera...</div>}
      {error && <div className="error">{error}</div>}
      <video id="video" className="video" />
      <style>{`
        .scanner-box {
          width: 325px;
          height: 516px;
          border: 2px solid #ffffff;
          border-radius: 8px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: #000000;
        }

        .video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .loading,
        .error {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          text-align: center;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 4px;
          z-index: 10;
        }

        .error {
          color: white;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
