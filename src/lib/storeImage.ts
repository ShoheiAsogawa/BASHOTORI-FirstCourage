// 店舗画像URL生成ユーティリティ

/**
 * 店舗名と住所から店舗に関連する画像URLを生成
 * 店舗名のハッシュ値を使用して一貫した画像を表示（Picsum Photos使用）
 */
export function generateStoreImageUrl(storeName: string, address: string): string {
  // 店舗名と住所からハッシュ値を生成（同じ店舗には同じ画像を表示）
  const seed = `${storeName}${address}`.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  // Picsum Photos（無料、APIキー不要）
  // seedを使用して同じ店舗には同じ画像を表示
  const imageId = Math.abs(seed) % 1000;
  return `https://picsum.photos/seed/${imageId}/500/300`;
}

/**
 * マークダウンテキストを解析して、写真URLがない施設に自動的に写真を追加
 */
export function addStoreImagesToMarkdown(markdown: string): string {
  // 施設の見出し（### で始まる）を検出
  const lines = markdown.split('\n');
  const result: string[] = [];
  let currentStore: { name: string; address: string | null } | null = null;
  let inStoreSection = false;
  let hasImage = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 見出しを検出（### で始まる）
    if (line.startsWith('### ')) {
      // 前の施設の処理
      if (currentStore && !hasImage && currentStore.address) {
        const imageUrl = generateStoreImageUrl(currentStore.name, currentStore.address);
        result.push(`![${currentStore.name}](${imageUrl})`);
        result.push('');
      }
      
      // 新しい施設の開始
      const storeName = line.replace(/^###\s+/, '').replace(/\s*（.*?）\s*$/, '').trim();
      currentStore = { name: storeName, address: null };
      inStoreSection = true;
      hasImage = false;
      result.push(line);
      continue;
    }

    // 画像があるかチェック
    if (inStoreSection && line.match(/^!\[.*?\]\(.*?\)/)) {
      hasImage = true;
      result.push(line);
      continue;
    }

    // 住所を抽出
    if (inStoreSection && currentStore && line.includes('**住所**:')) {
      const addressMatch = line.match(/\*\*住所\*\*:\s*(.+)/);
      if (addressMatch) {
        currentStore.address = addressMatch[1].trim();
      }
      result.push(line);
      continue;
    }

    // 空行で施設セクションが終わる可能性
    if (inStoreSection && line.trim() === '' && i < lines.length - 1) {
      const nextLine = lines[i + 1];
      // 次の行が見出しでない場合、施設セクションは続く
      if (!nextLine.startsWith('### ')) {
        result.push(line);
        continue;
      }
    }

    result.push(line);
  }

  // 最後の施設の処理
  if (currentStore && !hasImage && currentStore.address) {
    const imageUrl = generateStoreImageUrl(currentStore.name, currentStore.address);
    result.push(`![${currentStore.name}](${imageUrl})`);
    result.push('');
  }

  return result.join('\n');
}

