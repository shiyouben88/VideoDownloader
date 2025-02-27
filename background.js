chrome.action.onClicked.addListener(async (tab) => {
  // 获取视频ID
  const [{result}] = await chrome.scripting.executeScript({
    target: {tabId: tab.id},
    function: () => {
      // 使用更精确的选择器找到正在播放的视频
      const videoElement = document.querySelector('[data-e2e="feed-active-video"]');
      return videoElement ? videoElement.getAttribute('data-e2e-vid') : null;
    }
  });
  
  if (!result) {
    console.error('未找到视频ID');
    return;
  }

  // 打开新标签页但保持在后台
  const newTab = await chrome.tabs.create({
    url: `https://www.douyin.com/video/${result}`,
    active: false  // 设置为false使新标签页在后台打开
  });

  // 等待页面加载完成
  setTimeout(async () => {
    const [{result: videoUrl}] = await chrome.scripting.executeScript({
      target: {tabId: newTab.id},
      function: () => {
        const videoSources = document.querySelectorAll('video source');
        for (const source of videoSources) {
          const url = source.getAttribute('src');
          if (url && url.includes('douyin.com/aweme')) {
            return url;
          }
        }
        return null;
      }
    });

    if (videoUrl) {
      // 下载视频
      chrome.downloads.download({
        url: videoUrl,
        filename: `douyin_${result}.mp4`
      });
      
      // 关闭新开的标签页
      chrome.tabs.remove(newTab.id);
    }
  }, 3000); // 给页面3秒加载时间
}); 