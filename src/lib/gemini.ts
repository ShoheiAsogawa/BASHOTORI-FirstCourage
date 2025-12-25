// Gemini API呼び出し（AWS Lambda経由）
const AWS_API_GATEWAY_URL = import.meta.env.VITE_AWS_API_GATEWAY_URL;

export async function callGemini(prompt: string): Promise<string> {
  if (!AWS_API_GATEWAY_URL) {
    // 開発環境ではモックレスポンスを返す
    console.warn('AWS API Gateway URL not set, returning mock response');
    return mockGeminiResponse(prompt);
  }

  try {
    const response = await fetch(`${AWS_API_GATEWAY_URL}/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result || data.text || 'エラー: レスポンス形式が不正です';
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

// モックレスポンス（開発用）
function mockGeminiResponse(prompt: string): string {
  if (prompt.includes('売上シミュレーション')) {
    return `### 📊 AI売上予測\n- **予想日販**: 50,000円 〜 80,000円\n- **成功確率**: 70%\n- **推奨商材**: 貴金属、切手など\n\n### 💡 攻略アドバイス\n通行量が多いため、目立つ場所での集客が期待できます。`;
  } else if (prompt.includes('アドバイス')) {
    return '【AI営業アドバイス】\n今月は交渉中の案件が増えていますね！成約率を上げるため、優先順位をつけてフォローアップを強化しましょう。';
  } else if (prompt.includes('施設')) {
    return `### 施設名\n- **ジャンル**: ショッピングモール\n- **住所**: 東京都...\n- **Googleマップ**: [地図を見る](https://www.google.com/maps)\n- **特徴**: 集客力が高く、催事に適しています。`;
  }
  return 'AI分析結果（モック）';
}

