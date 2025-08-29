"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";

export default function RecorderWidget({ onBlob }: { onBlob: (blob: Blob) => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ws, setWs] = useState<WaveSurfer | null>(null);
  const [rec, setRec] = useState<{ startRecording: () => void; stopRecording: () => void } | null>(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#a8b3c4",
      progressColor: "#0B92F9",
      height: 64,
      cursorWidth: 0,
    });
    const recorder = wavesurfer.registerPlugin(RecordPlugin.create());
    recorder.on("record-end", (blob: Blob) => {
      onBlob(blob);
      setRecording(false);
    });
    setWs(wavesurfer);
    setRec(recorder);
    return () => wavesurfer.destroy();
  }, [onBlob]);

  return (
    <div className="space-y-2">
      <div ref={containerRef} />
      <div className="flex items-center gap-2">
        {!recording ? (
          <button type="button" className="app-btn-outline text-sm" onClick={() => { rec?.startRecording?.(); setRecording(true); }}>Start</button>
        ) : (
          <button type="button" className="app-btn-outline text-sm" onClick={() => rec?.stopRecording?.()}>Stop</button>
        )}
      </div>
    </div>
  );
}


