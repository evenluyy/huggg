// Cloudflare Worker 增强版 - 模拟人类行为
const URLS = [
  "https://mowupo-mohujj.hf.space/login"
 
];

// 随机工具函数
const random = {
  // 随机整数 [min, max]
  int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  
  // 随机浮点数 [min, max)
  float: (min, max) => Math.random() * (max - min) + min,
  
  // 随机延迟（毫秒）
  delay: (min, max) => new Promise(resolve => setTimeout(resolve, random.int(min, max))),
  
  // 随机选择数组元素
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)]
};

// 模拟浏览器行为 - 构造请求头
function getHumanHeaders() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];
  
  const acceptLanguages = ['zh-CN,zh;q=0.9,en;q=0.8', 'en-US,en;q=0.9', 'zh-CN,zh;q=0.9'];
  const acceptEncodings = ['gzip, deflate, br', 'gzip, deflate'];
  const secChUas = [
    '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    '"Not_A Brand";v="8", "Chromium";v="119", "Google Chrome";v="119"'
  ];
  
  return {
    'User-Agent': random.pick(userAgents),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': random.pick(acceptLanguages),
    'Accept-Encoding': random.pick(acceptEncodings),
    'Sec-Ch-Ua': random.pick(secChuas),
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': random.pick(['"Windows"', '"macOS"', '"Linux"']),
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
    // 随机添加一些常见但非必要的头
    'DNT': random.pick(['0', '1']),
  };
}

// 模拟人类访问流程
async function humanLikeVisit(url) {
  const startTime = Date.now();
  
  // 1. 模拟思考延迟（人类打开网页前的停顿）
  await random.delay(500, 2000);
  
  // 2. 构造请求
  const headers = getHumanHeaders();
  
  // 3. 随机选择请求方式（主要是GET，偶尔HEAD）
  const method = Math.random() < 0.95 ? 'GET' : 'HEAD';
  
  // 4. 发起请求
  const response = await fetch(url, {
    method: method,
    headers: headers,
    // 随机超时时间
    cf: {
      cacheTtl: 0,
      cacheEverything: false,
    }
  });
  
  // 5. 模拟人类读取页面时间（随机等待）
  await random.delay(1000, 4000);
  
  // 6. 模拟滚动行为（如果需要获取内容长度）
  const contentLength = response.headers.get('content-length') || 'unknown';
  
  // 7. 模拟鼠标移动（无法在Worker中真实模拟，但可以记录）
  // 实际上Worker无法模拟鼠标，这里只是演示逻辑
  
  const elapsed = Date.now() - startTime;
  
  // 8. 随机失败（偶尔模拟网络波动，提高真实性）
  if (Math.random() < 0.05) { // 5%概率重试一次
    await random.delay(1000, 3000);
    // 重新请求...
  }
  
  return {
    url,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers),
    contentLength: contentLength,
    responseTime: elapsed,
    success: response.ok,
    method: method,
    timestamp: new Date().toISOString()
  };
}

// 主调度函数
export default {
  // 定时触发
  async scheduled(event, env, ctx) {
    console.log(`🚀 开始监控 ${URLS.length} 个URL...`);
    
    const results = [];
    
    for (let i = 0; i < URLS.length; i++) {
      const url = URLS[i];
      
      try {
        // 访问前随机延迟（模拟真实用户访问间隔）
        if (i > 0) {
          const delay = random.int(2000, 5000); // 2-5秒间隔
          console.log(`⏳ 等待 ${delay}ms 后访问下一个...`);
          await random.delay(delay);
        }
        
        console.log(`🌐 [${i+1}/${URLS.length}] 访问: ${url}`);
        const result = await humanLikeVisit(url);
        results.push(result);
        
        // 输出简要结果
        console.log(`✅ ${url} - 状态: ${result.status} - 耗时: ${result.responseTime}ms`);
        
      } catch (error) {
        console.error(`❌ ${url} - 错误: ${error.message}`);
        results.push({
          url,
          error: error.message,
          success: false,
          timestamp: new Date().toISOString()
        });
        
        // 出错后额外等待
        await random.delay(1000, 3000);
      }
    }
    
    // 统计汇总
    const successCount = results.filter(r => r.success).length;
    console.log(`📊 完成: 成功 ${successCount}/${URLS.length}`);
    
    // 如果有失败，记录详细错误
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      console.log(`⚠️ 失败详情:`, JSON.stringify(failures));
    }
    
    // 可选：仅记录失败日志到KV（用于后续分析）
    // if (env.KV_NAMESPACE && failures.length > 0) {
    //   await env.KV_NAMESPACE.put(
    //     `failure_${Date.now()}`,
    //     JSON.stringify(failures)
    //   );
    // }
  },
  
  // HTTP触发（用于手动测试）
  async fetch(request, env) {
    // 只允许GET请求
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }
    
    // 手动触发监控（立即执行）
    const results = [];
    for (let i = 0; i < URLS.length; i++) {
      const url = URLS[i];
      try {
        if (i > 0) {
          await random.delay(1000, 3000);
        }
        const result = await humanLikeVisit(url);
        results.push(result);
      } catch (error) {
        results.push({
          url,
          error: error.message,
          success: false
        });
      }
    }
    
    // 返回JSON格式结果
    return new Response(JSON.stringify({
      timestamp: new Date().toISOString(),
      total: results.length,
      success: results.filter(r => r.success).length,
      results: results
    }, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
