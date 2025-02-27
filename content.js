const platforms = {
  douyin: {
    isCurrentPlatform: () => window.location.hostname.includes('douyin.com'),
    getVideoId: () => {
      const videoElement = document.querySelector('[data-e2e="feed-active-video"]');
      return videoElement ? videoElement.getAttribute('data-e2e-vid') : null;
    },
    findVideoUrl: () => {
      const videoSources = document.querySelectorAll('video source');
      for (const source of videoSources) {
        const url = source.getAttribute('src');
        if (url && url.includes('douyin.com/aweme')) {
          return url;
        }
      }
      return null;
    }
  },
  
  tiktok: {
    isCurrentPlatform: () => window.location.hostname.includes('tiktok.com'),
    getVideoId: () => {
      // TikTok不需要获取视频ID，直接在当前页面获取视频URL
      return null;
    },
    findVideoUrl: () => {
      const videoSources = document.querySelectorAll('video source');
      for (const source of videoSources) {
        const url = source.getAttribute('src');
        if (url && url.includes('tiktok.com/aweme/v1/play')) {
          return url;
        }
      }
      return null;
    }
  }
};

function getCurrentPlatform() {
  return Object.values(platforms).find(platform => platform.isCurrentPlatform());
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const platform = getCurrentPlatform();
  if (!platform) return;

  if (request.action === 'getVideoId') {
    sendResponse({videoId: platform.getVideoId()});
  } else if (request.action === 'getVideoUrl') {
    sendResponse({videoUrl: platform.findVideoUrl()});
  }
}); 