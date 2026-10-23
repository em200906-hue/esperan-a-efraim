// Audio synthesizer using Web Audio API for harmonic prayer bell / chime
let audioCtx: AudioContext | null = null;

export function playHarmonicPrayerChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // A serene, celestial major triad chord with gentle bell envelope (C5, E5, G5, C6)
    // 523.25 Hz (C5), 659.25 Hz (E5), 783.99 Hz (G5), 1046.50 Hz (C6)
    const frequencies = [523.25, 659.25, 783.99, 1046.50];

    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.2, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
    masterGain.connect(audioCtx.destination);

    frequencies.forEach((freq, index) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = index === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Stagger slightly for an organic wind-chime / harp ripple feel
      const startTime = now + index * 0.04;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.18 / (index + 1), startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.00001, startTime + 2.0);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + 2.2);
    });
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
}
