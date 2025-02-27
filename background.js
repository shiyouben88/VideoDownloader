async function downloadDouyinVideo(tab) {
  // 获取视频ID
  const [{result: videoId}] = await chrome.scripting.executeScript({
    target: {tabId: tab.id},
    function: () => {
      const videoElement = document.querySelector('[data-e2e="feed-active-video"]');
      return videoElement ? videoElement.getAttribute('data-e2e-vid') : null;
    }
  });
  
  if (!videoId) {
    console.error('未找到抖音视频ID');
    return;
  }

  // 打开新标签页但保持在后台
  const newTab = await chrome.tabs.create({
    url: `https://www.douyin.com/video/${videoId}`,
    active: false
  });

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
      await chrome.downloads.download({
        url: videoUrl,
        filename: `douyin_${videoId}.mp4`
      });
      chrome.tabs.remove(newTab.id);
    }
  }, 3000);
}

async function downloadTiktokVideo(tab, isRetry = false) {
  // 尝试在当前页面获取下载链接
  const [{result: videoUrl}] = await chrome.scripting.executeScript({
    target: {tabId: tab.id},
    function: () => {
      const videoSources = document.querySelectorAll('video source');
      for (const source of videoSources) {
        const url = source.getAttribute('src');
        if (url && url.includes('tiktok.com/aweme/v1/play')) {
          return url;
        }
      }
      return null;
    }
  });

  if (videoUrl) {
    const timestamp = new Date().getTime();
    await chrome.downloads.download({
      url: videoUrl,
      filename: `tiktok_${timestamp}.mp4`
    });
    return true;
  }

  // 如果是重试且仍然失败，则报错退出
  if (isRetry) {
    console.error('重试后仍未找到TikTok视频下载链接');
    return false;
  }

  // 第一次尝试失败，在后台打开新标签重试
  console.log('首次未找到下载链接，尝试在新标签页重试');
  const newTab = await chrome.tabs.create({
    url: tab.url,
    active: false
  });

  // 等待页面加载完成后重试
  return new Promise((resolve) => {
    setTimeout(async () => {
      const success = await downloadTiktokVideo(newTab, true);
      if (success) {
        chrome.tabs.remove(newTab.id);
      }
      resolve(success);
    }, 3000);
  });
}

chrome.action.onClicked.addListener(async (tab) => {
  const url = tab.url;
  if (url.includes('douyin.com')) {
    await downloadDouyinVideo(tab);
  } else if (url.includes('tiktok.com')) {
    await downloadTiktokVideo(tab);
  }
}); 