function getVideoId() {
  const videoElement = document.querySelector('[data-e2e-vid]');
  return videoElement ? videoElement.getAttribute('data-e2e-vid') : null;
}

function findVideoUrl() {
  const videoSources = document.querySelectorAll('video source');
  for (const source of videoSources) {
    const url = source.getAttribute('src');
    if (url && url.includes('douyin.com/aweme')) {
      return url;
    }
  }
  return null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getVideoId') {
    sendResponse({videoId: getVideoId()});
  } else if (request.action === 'getVideoUrl') {
    sendResponse({videoUrl: findVideoUrl()});
  }
}); 