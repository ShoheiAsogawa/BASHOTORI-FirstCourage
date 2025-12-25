import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Icon } from '../components/Icon';
import { callGemini } from '../lib/gemini';
import { marked } from 'marked';

export default function StoreSearchView() {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    setLoading(true);
    setResult('');

    const prompt = `
      あなたは日本の商業施設リサーチャーです。
      Google検索を利用して、以下の地域の、催事イベント（買取イベント）の開催に適した集客力のある商業施設を5〜10件リストアップしてください。
       
      ターゲット地域: ${location}
       
      必ず最新の検索結果に基づき、実在する店舗のみを提案してください。
      出力は以下のマークダウン形式でお願いします。各施設の「Googleマップへのリンク」は必ず含めてください。
       
      ### 施設名
      - **ジャンル**: 
      - **住所**: 
      - **Googleマップ**: [地図を見る](https://www.google.com/maps/search/?api=1&query=施設名+住所)
      - **特徴**: (集客力、客層など)
    `;

    try {
      const response = await callGemini(prompt);
      setResult(response);
    } catch (error) {
      setResult('検索エラーが発生しました。');
      console.error(error);
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

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="例: 大阪府岸和田市、神奈川県横浜市..."
                className="flex-1 p-3 bg-slate-50 border border-slate-300 rounded-xl text-base outline-none focus:ring-2 focus:ring-orange-500 transition"
              />
              <button
                type="submit"
                disabled={loading || !location}
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
            </form>
          </div>

          {result && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-fade-in">
              <div
                className="prose prose-slate max-w-none prose-strong:text-orange-700 prose-headings:text-slate-800 prose-a:text-orange-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: marked.parse(result) }}
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

