import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Icon } from '../components/Icon';
import { callGemini } from '../lib/gemini';
import { marked } from 'marked';
import { checkRateLimit, incrementRequestCount } from '../lib/rateLimit';
import { getCurrentLocation, reverseGeocode } from '../lib/location';

export default function StoreSearchView() {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);

  // 現在地を取得する関数
  const handleGetCurrentLocation = async () => {
    setLocationError(null);
    try {
      const currentLocation = await getCurrentLocation();
      const address = await reverseGeocode(currentLocation.latitude, currentLocation.longitude);
      setLocation(address);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '位置情報の取得に失敗しました';
      setLocationError(errorMessage);
      console.error('Location error:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    // リクエスト制限チェック
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      setResult(`❌ **リクエスト制限に達しました**\n\n本日の検索回数の上限（${rateLimit.limit}回）に達しました。\n明日（${new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString('ja-JP')}）にリセットされます。\n\n無料枠を超えないよう、1日あたり${rateLimit.limit}回までに制限しています。`);
      return;
    }

    setLoading(true);
    setResult('');
    setLocationError(null);

    // リクエストカウントを増やす
    incrementRequestCount();

    const prompt = `
あなたは日本の商業施設リサーチャーです。
**重要**: 必ずGoogle検索ツール（google_search）を使用して、実在する店舗情報のみを取得してください。
虚偽の情報や推測による情報は一切含めないでください。

以下の地域の、催事イベント（買取イベント）の開催に適した集客力のある商業施設を5〜10件リストアップしてください。

ターゲット地域: ${location}

**検索要件**:
1. Google検索ツールを使用して、実在する商業施設を検索してください
2. 各施設について、以下の情報を必ず確認してください：
   - 施設名（正確な名称）
   - 正確な住所
   - ジャンル・業種
   - GoogleマップのURL（実在する施設のみ）
   - **必ず各施設の写真URLを取得してください**（GoogleマップやGoogle検索結果から写真URLを取得）

**出力形式**（マークダウン）:
各施設について、以下の形式で出力してください。**写真は必ず埋め込み形式（![写真](URL)）で表示してください**：

### 施設名（実在する施設のみ）

![施設写真](写真の直接URL) <!-- 必ず写真URLを含めてください。Googleマップの写真URL、またはGoogle検索結果から取得した写真URLを使用してください -->

- **ジャンル**: 
- **住所**: 
- **Googleマップ**: [地図を見る](https://www.google.com/maps/search/?api=1&query=施設名+住所)
- **特徴**: (集客力、客層など、実在する情報のみ)

**写真URLの取得方法**:
- Google検索結果から写真URLを直接取得してください
- Googleマップの写真URLを使用してください（例: https://maps.googleapis.com/maps/api/place/photo など）
- 写真URLは必ず直接アクセス可能な形式で提供してください
- 各施設には必ず写真を含めてください

**注意事項**:
- 実在しない施設は絶対に含めないでください
- 推測や創作の情報は含めないでください
- Google検索で確認できない施設は除外してください
- 各施設のGoogleマップリンクが正しく動作することを確認してください
- **写真URLは必ず含めてください。写真がない施設は除外してください**
    `;

    try {
      // タイムアウト処理（100秒 - google_searchツール使用時は時間がかかるため）
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('検索がタイムアウトしました。時間をおいて再度お試しください。')), 100000);
      });

      const responsePromise = callGemini(prompt);
      const response = await Promise.race([responsePromise, timeoutPromise]);
      setResult(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      console.error('店舗検索エラー:', error);
      setResult(`❌ 検索エラーが発生しました。\n\n**エラー詳細**: ${errorMessage}\n\n**対処方法**:\n- ブラウザのコンソール（F12）で詳細なエラーを確認してください\n- 環境変数（VITE_GEMINI_API_KEY または VITE_AWS_API_GATEWAY_URL）が設定されているか確認してください`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="p-4 sm:p-6 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Icon name="Sparkles" className="text-orange-500" /> AI店舗検索{' '}
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                Google検索連動
              </span>
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              地域名を入力すると、AIがGoogle検索を行い、催事に適した商業施設をリストアップします。
            </p>

            <form onSubmit={handleSearch} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="例: 大阪府岸和田市、神奈川県横浜市..."
                  className="flex-1 p-3 bg-slate-50 border border-slate-300 rounded-xl text-base outline-none focus:ring-2 focus:ring-orange-500 transition"
                />
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition flex items-center gap-2 text-sm whitespace-nowrap"
                  title="現在地を取得"
                >
                  <Icon name="MapPin" size={18} />
                  <span className="hidden sm:inline">現在地</span>
                </button>
                <button
                  type="submit"
                  disabled={loading || !location || !checkRateLimit().allowed}
                  className="bg-slate-900 text-white px-4 py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-lg w-32 justify-center whitespace-nowrap text-sm"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-l-white rounded-full animate-spin" />
                      <span className="text-xs">検索中</span>
                    </div>
                  ) : (
                    <>
                      <Icon name="Search" size={18} /> 検索
                    </>
                  )}
                </button>
              </div>
              {locationError && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg flex items-center gap-2">
                  <Icon name="AlertCircle" size={14} />
                  {locationError}
                </div>
              )}
            </form>
          </div>

          {result && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-fade-in">
              <style>{`
                .store-search-result img {
                  display: block;
                  width: 100%;
                  max-width: 500px;
                  height: auto;
                  margin: 1rem auto;
                  border-radius: 0.75rem;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                  object-fit: cover;
                }
                .store-search-result h3 {
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                }
                .store-search-result h3:first-child {
                  margin-top: 0;
                }
              `}</style>
              <div
                className="store-search-result prose prose-slate max-w-none prose-strong:text-orange-700 prose-headings:text-slate-800 prose-a:text-orange-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ 
                  __html: marked.parse(result, {
                    breaks: true,
                    gfm: true,
                  })
                }}
              />
            </div>
          )}

          {!result && !loading && (
            <div className="text-center py-20 text-slate-400">
              <Icon name="Compass" size={48} className="mx-auto mb-4 opacity-20" />
              <p>地域を入力して検索を開始してください</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

