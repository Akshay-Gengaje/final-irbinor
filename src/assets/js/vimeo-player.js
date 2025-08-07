export class VimeoPlayer {
  constructor(playerId, videoId, options = {}) {
    this.playerId = playerId;
    this.videoId = videoId;
    this.options = {
      autoplay: true,
      loop: true,
      muted: true,
      controls: false,
      transparent: true,
      ...options,
    };
    this.player = null;
  }

  async initialize() {
    if (typeof Vimeo === 'undefined' || !Vimeo.Player) {
      console.error('Vimeo Player API not loaded');
      return;
    }

    this.player = new Vimeo.Player(this.playerId, {
      id: this.videoId,
      ...this.options,
    });

    // Load captions
    this.loadCaptions();

    // Handle player events
    this.player.on('loaded', () => {
      console.log('Video loaded');
    });
  }

  loadCaptions() {
    const captionsDiv = document.getElementById('captions');
    captionsDiv.innerText = 'Sample caption text'; // Replace with .vtt parsing or Vimeo API
  }

  toggleMute() {
    this.player.getMuted().then(muted => {
      if (muted) {
        this.player.setMuted(false);
        document.getElementById('mute-toggle').classList.remove('muted');
      } else {
        this.player.setMuted(true);
        document.getElementById('mute-toggle').classList.add('muted');
      }
    });
  }
}